// src/services/sendgridEmailSendService.js
const path = require('path');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');
const db = require('../../models');
const invoiceService = require('./invoiceService');
const quotationService = require('./quotationService');
const { generateInvoicePdfBuffer, generateQuotationPdfBuffer } = require('./invoicePdfService');
const { SendgridSetting, Customer, Company } = db;

class SendgridEmailSendService {
  /**
   * Helper to format attachments into SendGrid expected structure.
   */
  formatAttachments(attachmentInput, reqFile) {
    const attachments = [];

    // Check multer uploaded file
    if (reqFile) {
      let contentBase64;
      if (reqFile.buffer) {
        contentBase64 = reqFile.buffer.toString('base64');
      } else if (reqFile.path && fs.existsSync(reqFile.path)) {
        contentBase64 = fs.readFileSync(reqFile.path).toString('base64');
      }
      if (contentBase64) {
        attachments.push({
          content: contentBase64,
          filename: reqFile.originalname || 'attachment',
          type: reqFile.mimetype || 'application/octet-stream',
          disposition: 'attachment',
        });
      }
    }

    // Check attachment in body
    if (attachmentInput) {
      if (Array.isArray(attachmentInput)) {
        attachmentInput.forEach((att) => {
          if (att && att.content) {
            attachments.push({
              content: att.content,
              filename: att.filename || 'attachment',
              type: att.type || 'application/octet-stream',
              disposition: 'attachment',
            });
          }
        });
      } else if (typeof attachmentInput === 'object' && attachmentInput.content) {
        attachments.push({
          content: attachmentInput.content,
          filename: attachmentInput.filename || 'attachment',
          type: attachmentInput.type || 'application/octet-stream',
          disposition: 'attachment',
        });
      } else if (typeof attachmentInput === 'string') {
        if (fs.existsSync(attachmentInput)) {
          const fileBuffer = fs.readFileSync(attachmentInput);
          attachments.push({
            content: fileBuffer.toString('base64'),
            filename: path.basename(attachmentInput),
            type: 'application/octet-stream',
            disposition: 'attachment',
          });
        } else {
          attachments.push({
            content: attachmentInput,
            filename: 'attachment',
            type: 'application/octet-stream',
            disposition: 'attachment',
          });
        }
      }
    }

    return attachments.length > 0 ? attachments : undefined;
  }

  /**
   * Send an email using company SendGrid credentials to a customer's email.
   * @param {Object} params
   * @param {number} params.companyId - ID of the company whose SendGrid settings to use.
   * @param {number} params.customerId - ID of the customer to receive the email.
   * @param {string} params.message - Text/HTML body message.
   * @param {string} [params.subject] - Email subject.
   * @param {string} [params.fromEmail] - Optional sender email.
   * @param {Object|Array|string} [params.attachment] - Attachment content or object.
   * @param {Object} [params.reqFile] - Express multer file object if uploaded via form-data.
   * @returns {Promise<Object>} SendGrid email dispatch result.
   */
  async sendEmail({ companyId, customerId, message, subject, fromEmail, attachment, reqFile }) {
    if (!companyId || !customerId || !message) {
      throw new Error('Missing required fields: company_id, customer_id, or message');
    }

    // 1. Fetch SendGrid settings for company
    const setting = await SendgridSetting.findOne({
      where: { company_id: companyId, is_deleted: 0 },
    });

    if (!setting || !setting.sendgrid_api_key) {
      throw new Error('SendGrid settings or API key not found for the specified company');
    }

    // 2. Fetch customer email
    const customer = await Customer.findOne({
      where: { id: customerId, is_deleted: 0 },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }
    if (!customer.email) {
      throw new Error('Customer does not have an email address');
    }

    // 3. Determine sender email
    let senderEmail = fromEmail || setting.email || setting.from_email || setting.sender_email;
    if (!senderEmail) {
      const company = await Company.findOne({
        where: { id: companyId, is_deleted: 0 },
      });
      if (company && company.email) {
        senderEmail = company.email;
      }
    }

    if (!senderEmail) {
      senderEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@garage.com';
    }

    // 4. Configure SendGrid API key
    sgMail.setApiKey(setting.sendgrid_api_key);

    // 5. Format attachments if present
    const formattedAttachments = this.formatAttachments(attachment, reqFile);

    // 6. Build message payload
    const msg = {
      to: customer.email,
      from: senderEmail,
      subject: subject || 'Notification from Garage',
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
    };

    if (formattedAttachments) {
      msg.attachments = formattedAttachments;
    }

    // 7. Send email
    const response = await sgMail.send(msg);

    return {
      success: true,
      message: 'Email sent successfully',
      to: customer.email,
      from: senderEmail,
      statusCode: response[0] ? response[0].statusCode : 202,
    };
  }

  /**
   * Creates the existing Invoice Listing PDF and emails it to the invoice's customer.
   * @param {number} invoiceId
   */
  async sendInvoiceEmail({ invoiceId }) {
    if (!invoiceId) throw createHttpError('invoice_id is required', 400);

    const invoice = await invoiceService.getInvoiceById(invoiceId);
    if (!invoice) throw createHttpError('Invoice not found', 404);

    const vehicle = invoice.taskCard?.quotation?.vehicle;
    if (!vehicle || vehicle.is_deleted) throw createHttpError('Vehicle not found for this invoice', 404);

    const customer = vehicle.customer;
    if (!customer || customer.is_deleted) throw createHttpError('Customer not found for this vehicle', 404);
    if (!customer.email) throw createHttpError('Customer does not have an email address', 400);

    // The table uses `email` as the SendGrid sender email field.
    const setting = await SendgridSetting.findOne({
      where: { company_id: invoice.company_id, is_deleted: 0 },
    });
    if (!setting || !setting.sendgrid_api_key || !setting.email) {
      throw createHttpError('SendGrid settings are missing for this company', 400);
    }

    const company = await Company.findOne({ where: { id: invoice.company_id, is_deleted: 0 } });
    if (!company) throw createHttpError('Company not found for this invoice', 404);

    const companyAddress = [company.address, company.city, company.state, company.zip_code ?? company.zipCode]
      .filter(Boolean)
      .join(', ') || '—';
    let pdfBuffer;
    try {
      pdfBuffer = await generateInvoicePdfBuffer({
        companyName: company.name ?? 'Company',
        companyEmail: company.email ?? '—',
        companyCountry: company.country ?? '—',
        companyPhone: company.phone ?? '—',
        companyAddress,
        companyRegNo: company.registration_no ?? company.registrationNo ?? '—',
        companyLogoUrl: company.logo_url ?? company.logoUrl ?? company.logo,
        invoiceNumber: invoice.invoice_number ?? `INV-${invoice.id}`,
        creationDate: invoice.creation_date ?? '',
        dueDate: invoice.due_date ?? invoice.dueDate ?? invoice.creation_date ?? '',
        paymentStatus: invoice.payment_status ?? 'pending',
        customerName: customer.name ?? '—',
        customerEmail: customer.email,
        customerPhone: customer.phone ?? '—',
        customerAddress: customer.address ?? '—',
        vehicleName: vehicle.name ?? ([vehicle.make, vehicle.model].filter(Boolean).join(' ') || '—'),
        vehicleMake: vehicle.make ?? '—',
        vehicleModel: vehicle.model ?? '—',
        vehicleVariant: vehicle.variant ?? '—',
        vehicleYear: vehicle.year ? String(vehicle.year) : '—',
        vin: vehicle.vin ?? vehicle.VIN ?? '—',
        licensePlate: vehicle.license_plate ?? vehicle.licensePlate ?? '—',
        notes: invoice.notes ?? '',
        includeLineItems: (invoice.details ?? []).length > 0,
        lineItems: (invoice.details ?? []).map((detail) => ({
          type: detail.type,
          description: detail.description ?? '',
          qty: Number(detail.qty ?? 0),
          unitPrice: Number(detail.unit_price ?? 0),
        })),
        subtotal: Number(invoice.subtotal ?? 0),
        taxPercentage: Number(invoice.tax_percentage ?? 0),
        taxAmount: Number(invoice.tax_amount ?? 0),
        discountPercentage: Number(invoice.discount_percentage ?? 0),
        discountAmount: Number(invoice.discount ?? 0),
        total: Number(invoice.total ?? 0),
      });
    } catch {
      throw createHttpError('Unable to generate invoice PDF', 500);
    }

    try {
      return await this.sendEmail({
        companyId: invoice.company_id,
        customerId: customer.id,
        message: 'Your invoice is ready. Please review the attached document.',
        subject: 'Invoice Ready',
        fromEmail: setting.email,
        attachment: {
          content: pdfBuffer.toString('base64'),
          filename: `Invoice-${invoice.invoice_number ?? `INV-${invoice.id}`}.pdf`,
          type: 'application/pdf',
        },
      });
    } catch (error) {
      if (error.status) throw error;
      throw createHttpError('Unable to send invoice email', 502);
    }
  }


  async sendQuotationEmail({ quotationId }) {
    if (!quotationId) throw createHttpError('quotation_id is required', 400);

    const quotation = await quotationService.getQuotationById(quotationId);
    if (!quotation) throw createHttpError('Quotation not found', 404);

    const vehicle = quotation.vehicle;
    if (!vehicle || vehicle.is_deleted) throw createHttpError('Vehicle not found for this quotation', 404);
    const customer = vehicle.customer;
    if (!customer || customer.is_deleted) throw createHttpError('Customer not found for this vehicle', 404);
    if (!customer.email) throw createHttpError('Customer does not have an email address', 400);

    const setting = await SendgridSetting.findOne({ where: { company_id: quotation.company_id, is_deleted: 0 } });
    if (!setting || !setting.sendgrid_api_key || !setting.email) {
      throw createHttpError('SendGrid settings are missing for this company', 400);
    }
    const company = await Company.findOne({ where: { id: quotation.company_id, is_deleted: 0 } });
    if (!company) throw createHttpError('Company not found for this quotation', 404);

    let pdfBuffer;
    try {
      pdfBuffer = await generateQuotationPdfBuffer({
        companyName: company.name ?? 'Company', companyEmail: company.email ?? '—', companyCountry: company.country ?? '—',
        companyPhone: company.phone ?? '—',
        companyAddress: [company.address, company.city, company.state, company.zip_code ?? company.zipCode].filter(Boolean).join(', ') || '—',
        companyRegNo: company.registration_no ?? company.registrationNo ?? '—', companyLogoUrl: company.logo_url ?? company.logoUrl ?? company.logo,
        quotationNumber: quotation.quotation_number ?? `QT-${quotation.id}`, creationDate: quotation.creation_date ?? '',
        customerName: customer.name ?? '—', customerEmail: customer.email, customerPhone: customer.phone ?? '—', customerAddress: customer.address ?? '—',
        vehicleName: vehicle.name ?? ([vehicle.make, vehicle.model].filter(Boolean).join(' ') || '—'), vehicleMake: vehicle.make ?? '—',
        vehicleModel: vehicle.model ?? '—', vehicleVariant: vehicle.variant ?? '—', vehicleYear: vehicle.year ? String(vehicle.year) : '—',
        vin: vehicle.vin ?? vehicle.VIN ?? '—', licensePlate: vehicle.license_plate ?? vehicle.licensePlate ?? '—', note: quotation.note ?? '',
        includeLineItems: (quotation.details ?? []).length > 0,
        lineItems: (quotation.details ?? []).map((detail) => ({ type: detail.type, description: detail.description ?? '', qty: Number(detail.qty ?? 0), unitPrice: Number(detail.unit_price ?? 0) })),
        subtotal: Number(quotation.subtotal ?? 0), taxPercentage: Number(quotation.tax_percentage ?? 0), taxAmount: Number(quotation.tax_amount ?? 0),
        discountPercentage: Number(quotation.discount_percentage ?? 0), discountAmount: Number(quotation.discount ?? 0), total: Number(quotation.total ?? 0),
      });
    } catch {
      throw createHttpError('Unable to generate quotation PDF', 500);
    }

    try {
      return await this.sendEmail({
        companyId: quotation.company_id, customerId: customer.id,
        message: 'Your quotation is ready. Please review the attached document.',
        subject: 'Quotation Ready', fromEmail: setting.email,
        attachment: {
          content: pdfBuffer.toString('base64'),
          filename: `Quotation-${quotation.quotation_number ?? `QT-${quotation.id}`}.pdf`,
          type: 'application/pdf',
        },
      });
    } catch (error) {
      if (error.status) throw error;
      throw createHttpError('Unable to send quotation email', 502);
    }
    }


}

module.exports = new SendgridEmailSendService();

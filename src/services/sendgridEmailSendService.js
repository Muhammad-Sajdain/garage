// src/services/sendgridEmailSendService.js
const path = require('path');
const fs = require('fs');
const db = require('../../models');
const invoiceService = require('./invoiceService');
const towingInvoiceService = require('./towingInvoiceService');
const quotationService = require('./quotationService');
const taskCardService = require('./taskCardService');
const communicationLogService = require('./communicationLogService');
const { generateInvoicePdfBuffer, generateQuotationPdfBuffer } = require('./invoicePdfService');
const { SendgridSetting, Customer, Company } = db;

const createHttpError = (message, status) => Object.assign(new Error(message), { status });
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

const buildDocumentEmailContent = ({ customerName, vehicle, companyName, documentType }) => {
  const details = {
    make: vehicle.make || '—',
    model: vehicle.model || '—',
    year: vehicle.year ? String(vehicle.year) : '—',
    vin: vehicle.vin ?? vehicle.VIN ?? '—',
  };
  const greetingName = customerName || 'Customer';
  const shopName = companyName || 'our company';
  const isQuotation = documentType === 'quotation';
  const intro = isQuotation
    ? 'Please find attached the quotation for the requested vehicle repair or services.'
    : `Please find attached the ${documentType} for your reference and records.`;
  const review = isQuotation
    ? 'Kindly review the attached quotation and let us know if you would like to proceed with the proposed work.'
    : `Kindly review the attached ${documentType}.`;
  const closing = isQuotation
    ? `Thank you for considering ${shopName}. We look forward to your approval and the opportunity to serve you.`
    : `Thank you for choosing ${shopName}. We appreciate your trust in our services and look forward to serving you again.`;
  const questions = isQuotation
    ? '\n\nShould you have any questions or require further clarification, please feel free to contact us.'
    : '';
  const text = `Dear ${greetingName},\n\n${intro}\n\nVehicle Details:\n\nMake: ${details.make}\n\nModel: ${details.model}\n\nYear: ${details.year}\n\nVIN: ${details.vin}\n\n${review}${questions}\n\n${closing}\n\nBest regards,\n${shopName}`;
  const html = `<p>Dear ${escapeHtml(greetingName)},</p>
    <p>${escapeHtml(intro)}</p>
    <p><strong>Vehicle Details:</strong></p>
    <ul>
      <li><strong>Make:</strong> ${escapeHtml(details.make)}</li>
      <li><strong>Model:</strong> ${escapeHtml(details.model)}</li>
      <li><strong>Year:</strong> ${escapeHtml(details.year)}</li>
      <li><strong>VIN:</strong> ${escapeHtml(details.vin)}</li>
    </ul>
    <p>${escapeHtml(review)}</p>
    ${isQuotation ? '<p>Should you have any questions or require further clarification, please feel free to contact us.</p>' : ''}
    <p>${escapeHtml(closing)}</p>
    <p>Best regards,<br>${escapeHtml(shopName)}</p>`;

  return { text, html };
};

class SendgridEmailSendService {
  async createEmailCommunicationLog({ companyId, userId, text, scope = 'customer' }) {
    if (!userId) {
      throw createHttpError('Unable to create email communication log: document creator is missing', 500);
    }

    await communicationLogService.createCommunicationLog({
      company_id: companyId,
      user_id: userId,
      channel: 'Email',
      text,
      scope,
      status: 1,
    });
  }

  /**
   * Helper to normalize supported attachment inputs into Resend's format.
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
   * Send an email using the company's Resend API key to a customer's email.
   * @param {Object} params
   * @param {number} params.companyId - ID of the company whose email settings to use.
   * @param {number} params.customerId - ID of the customer to receive the email.
   * @param {string} params.message - Text/HTML body message.
   * @param {string} [params.subject] - Email subject.
   * @param {string} [params.fromEmail] - Optional sender email.
   * @param {Object|Array|string} [params.attachment] - Attachment content or object.
   * @param {Object} [params.reqFile] - Express multer file object if uploaded via form-data.
   * @returns {Promise<Object>} Resend email dispatch result.
   */
  async sendEmail({ companyId, customerId, message, subject, fromEmail, attachment, reqFile, htmlContent }) {
    if (!companyId || !customerId || !message) {
      throw new Error('Missing required fields: company_id, customer_id, or message');
    }

    // API keys remain in the existing settings column for compatibility.
    const setting = await SendgridSetting.findOne({
      where: { company_id: companyId, is_deleted: 0 },
    });

    if (!setting || !setting.sendgrid_api_key) {
      throw createHttpError('Resend API key is missing from this company\'s email settings', 400);
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
      senderEmail = process.env.RESEND_FROM_EMAIL;
    }
    if (!senderEmail) throw createHttpError('Resend sender email is not configured', 400);

    const formattedAttachments = this.formatAttachments(attachment, reqFile);
    const attachments = formattedAttachments?.map((item) => ({
      filename: item.filename,
      content: item.content,
      content_type: item.type,
    }));

    let response;
    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${setting.sendgrid_api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderEmail,
          to: customer.email,
          subject: subject || 'Notification from Garage',
          text: message,
          html: htmlContent || `<p>${message.replace(/\n/g, '<br>')}</p>`,
          ...(attachments?.length ? { attachments } : {}),
        }),
      });
    } catch (error) {
      console.error('Resend email request failed:', error.message);
      throw createHttpError('Unable to send email. Please contact the IT support team to resolve this matter.', 502);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Resend email failed:', response.status, error);
      throw createHttpError('Unable to send email. Please contact the IT support team to resolve this matter.', 502);
    }

    const result = await response.json().catch(() => ({}));

    return {
      success: true,
      message: 'Email sent successfully',
      to: customer.email,
      from: senderEmail,
      id: result.id,
      statusCode: response.status,
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

    // Use the company's configured sender address with the Resend API key.
    const setting = await SendgridSetting.findOne({
      where: { company_id: invoice.company_id, is_deleted: 0 },
    });
    if (!setting || !setting.sendgrid_api_key || !setting.email) {
      throw createHttpError('Resend API key or sender email is missing from this company\'s email settings', 400);
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
          vehicleMake: vehicle.make ?? '—',
          vehicleModel: vehicle.model ?? '—',
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
      const emailContent = buildDocumentEmailContent({
        customerName: customer.name,
        vehicle,
        companyName: company.name,
        documentType: 'invoice',
      });
      const result = await this.sendEmail({
        companyId: invoice.company_id,
        customerId: customer.id,
        message: emailContent.text,
        htmlContent: emailContent.html,
        subject: 'Invoice Ready',
        fromEmail: setting.email,
        attachment: {
          content: pdfBuffer.toString('base64'),
          filename: `Invoice-${invoice.invoice_number ?? `INV-${invoice.id}`}.pdf`,
          type: 'application/pdf',
        },
      });

      await this.createEmailCommunicationLog({
        companyId: invoice.company_id,
        userId: invoice.created_by,
        text: 'Invoice Ready',
        scope: 'customer',
      });

      return result;
    } catch (error) {
      if (error.status) throw error;
      throw createHttpError('Unable to send invoice email', 502);
    }
  }


  async sendTowingInvoiceEmail({ towingInvoiceId }) {
    if (!towingInvoiceId) throw createHttpError('towing_invoice_id is required', 400);

    const invoice = await towingInvoiceService.getTowingInvoiceById(towingInvoiceId);
    if (!invoice) throw createHttpError('Towing invoice not found', 404);
    const vehicle = invoice.vehicle;
    const customer = vehicle?.customer;
    if (!vehicle || vehicle.is_deleted) throw createHttpError('Vehicle not found for this towing invoice', 404);
    if (!customer || customer.is_deleted || !customer.email) throw createHttpError('Customer does not have an email address', 400);

    const setting = await SendgridSetting.findOne({ where: { company_id: invoice.company_id, is_deleted: 0 } });
    if (!setting?.sendgrid_api_key || !setting.email) throw createHttpError('Resend API key or sender email is missing from this company\'s email settings', 400);
    const company = await Company.findOne({ where: { id: invoice.company_id, is_deleted: 0 } });
    if (!company) throw createHttpError('Company not found for this towing invoice', 404);

    let pdfBuffer;
    try {
      pdfBuffer = await generateInvoicePdfBuffer({
        companyName: company.name ?? 'Company', companyEmail: company.email ?? 'â€”', companyCountry: company.country ?? 'â€”', companyPhone: company.phone ?? 'â€”',
        companyAddress: [company.address, company.city, company.state, company.zip_code ?? company.zipCode].filter(Boolean).join(', ') || 'â€”',
        companyRegNo: company.registration_no ?? company.registrationNo ?? 'â€”', companyLogoUrl: company.logo_url ?? company.logoUrl ?? company.logo,
        invoiceNumber: invoice.invoice_number ?? `TOW-${invoice.id}`, creationDate: invoice.creation_date ?? '', dueDate: invoice.creation_date ?? '', paymentStatus: invoice.payment_status ?? 'pending',
        customerName: customer.name ?? 'â€”', customerEmail: customer.email, customerPhone: customer.phone ?? 'â€”', customerAddress: customer.address ?? 'â€”',
        vehicleMake: vehicle.make ?? 'â€”', vehicleModel: vehicle.model ?? 'â€”', vehicleYear: vehicle.year ? String(vehicle.year) : 'â€”', vin: vehicle.vin ?? vehicle.VIN ?? 'â€”', licensePlate: vehicle.license_plate ?? vehicle.licensePlate ?? 'â€”',
        notes: `Pickup: ${invoice.pick_up_address ?? 'â€”'}\nDrop off: ${invoice.drop_off_address ?? 'â€”'}`, includeLineItems: true,
        towingDetails: { pickUpAddress: invoice.pick_up_address, dropOffAddress: invoice.drop_off_address },
        lineItems: [{ type: 'service', description: 'Towing service', qty: Number(invoice.miles ?? 0), unitPrice: Number(invoice.rate ?? 0) }],
        subtotal: Number(invoice.subtotal ?? 0), taxPercentage: Number(invoice.tax_percentage ?? 0), taxAmount: Number(invoice.tax_amount ?? 0), discountPercentage: Number(invoice.discount_percentage ?? 0), discountAmount: Number(invoice.discount ?? 0), total: Number(invoice.total ?? 0), documentTitle: 'TOWING INVOICE', quantityLabel: 'Miles', unitPriceLabel: 'Rate / Mile',
      });
    } catch { throw createHttpError('Unable to generate towing invoice PDF', 500); }

    const emailContent = buildDocumentEmailContent({
      customerName: customer.name,
      vehicle,
      companyName: company.name,
      documentType: 'towing invoice',
    });
    const result = await this.sendEmail({
      companyId: invoice.company_id, customerId: customer.id, message: emailContent.text, htmlContent: emailContent.html, subject: 'Towing Invoice Ready', fromEmail: setting.email,
      attachment: { content: pdfBuffer.toString('base64'), filename: `Towing-Invoice-${invoice.invoice_number ?? invoice.id}.pdf`, type: 'application/pdf' },
    });
    await this.createEmailCommunicationLog({ companyId: invoice.company_id, userId: invoice.created_by, text: 'Towing Invoice Ready', scope: 'customer' });
    return result;
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
      throw createHttpError('Resend API key or sender email is missing from this company\'s email settings', 400);
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
        vehicleMake: vehicle.make ?? '—',
        vehicleModel: vehicle.model ?? '—',
        vehicleYear: vehicle.year ? String(vehicle.year) : '—',
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
      const emailContent = buildDocumentEmailContent({
        customerName: customer.name,
        vehicle,
        companyName: company.name,
        documentType: 'quotation',
      });
      const result = await this.sendEmail({
        companyId: quotation.company_id, customerId: customer.id,
        message: emailContent.text,
        htmlContent: emailContent.html,
        subject: 'Quotation Ready', fromEmail: setting.email,
        attachment: {
          content: pdfBuffer.toString('base64'),
          filename: `Quotation-${quotation.quotation_number ?? `QT-${quotation.id}`}.pdf`,
          type: 'application/pdf',
        },
      });

      await this.createEmailCommunicationLog({
        companyId: quotation.company_id,
        userId: quotation.created_by,
        text: 'Quotation Ready',
        scope: 'customer',
      });

      return result;
    } catch (error) {
      if (error.status) throw error;
      throw createHttpError('Unable to send quotation email', 502);
    }
    }

  async sendCarReadyEmail({ taskCardId }) {
    if (!taskCardId) throw createHttpError('task_card_id is required', 400);

    const taskCard = await taskCardService.getTaskCardById(taskCardId);
    if (!taskCard) throw createHttpError('Task card not found', 404);

    const tasks = taskCard.tasks ?? [];
    const isComplete = tasks.length > 0 && tasks.every((task) =>
      ['completed', 'compeleted'].includes(String(task.task_status ?? '').trim().toLowerCase()),
    );
    if (!isComplete) throw createHttpError('Task card must be complete before sending a car-ready email', 400);

    const vehicle = taskCard.quotation?.vehicle;
    if (!vehicle || vehicle.is_deleted) throw createHttpError('Vehicle not found for this task card', 404);

    const customer = vehicle.customer;
    if (!customer || customer.is_deleted) throw createHttpError('Customer not found for this vehicle', 404);
    if (!customer.email) throw createHttpError('Customer does not have an email address', 400);

    const vin = vehicle.vin ?? vehicle.VIN;
    if (!vin) throw createHttpError('Vehicle VIN is required to send a car-ready email', 400);

    const company = await Company.findOne({ where: { id: taskCard.company_id, is_deleted: 0 } });
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]);
    const customerName = customer.name || 'Customer';
    const companyName = company?.name || 'Your Auto Body Shop';
    const make = vehicle.make || '—';
    const model = vehicle.model || '—';
    const year = vehicle.year ? String(vehicle.year) : '—';
    const message = `Dear ${customerName},\n\nWe are pleased to inform you that your vehicle has been fully repaired and is now ready for collection.\n\nVehicle Details:\n- Make: ${make}\n- Model: ${model}\n- Year: ${year}\n- VIN: ${vin}\n\nPlease collect your vehicle at your earliest convenience.\n\nThank you for choosing our services. We appreciate your trust in us and look forward to serving you again.\n\nBest regards,\n${companyName}`;
    const htmlContent = `<p>Dear ${escapeHtml(customerName)},</p>
      <p>We are pleased to inform you that your vehicle has been fully repaired and is now ready for collection.</p>
      <p><strong>Vehicle Details:</strong></p>
      <ul>
        <li><strong>Make:</strong> ${escapeHtml(make)}</li>
        <li><strong>Model:</strong> ${escapeHtml(model)}</li>
        <li><strong>Year:</strong> ${escapeHtml(year)}</li>
        <li><strong>VIN:</strong> ${escapeHtml(vin)}</li>
      </ul>
      <p>Please collect your vehicle at your earliest convenience.</p>
      <p>Thank you for choosing our services. We appreciate your trust in us and look forward to serving you again.</p>
      <p>Best regards,<br>${escapeHtml(companyName)}</p>`;

    const companyId = taskCard.company_id;
    const setting = await SendgridSetting.findOne({ where: { company_id: companyId, is_deleted: 0 } });
    if (!setting || !setting.sendgrid_api_key || !setting.email) {
      throw createHttpError('Resend API key or sender email is missing from this company\'s email settings', 400);
    }

    const result = await this.sendEmail({
      companyId,
      customerId: customer.id,
      subject: 'Your Vehicle Is Ready for Collection',
      message,
      htmlContent,
      fromEmail: setting.email,
    });

    await db.Notification.create({
      company_id: companyId,
      user_id: customer.id,
      scope: 'customer',
      text: `Your vehicle VIN: ${vin} is ready, please collect your vehicle at your earliest convenience.`,
      read: 0,
    });

    await this.createEmailCommunicationLog({ companyId, userId: taskCard.created_by, text: 'Your Vehicle Is Ready for Collection', scope: 'customer' });
    return result;
  }


}

module.exports = new SendgridEmailSendService();

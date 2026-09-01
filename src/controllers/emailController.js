// src/controllers/emailController.js
const sendgridEmailSendService = require('../services/sendgridEmailSendService');

/**
 * POST /email (or POST /send-email)
 * Body: { message: string, company_id: number, customer_id: number, subject?: string, attachment?: any }
 * Form-Data: message, company_id, customer_id, subject, attachment (file upload)
 */
const sendEmail = async (req, res) => {
  try {
    const companyId = req.body.company_id || req.body.companyId;
    const customerId = req.body.customer_id || req.body.customerId;
    const message = req.body.message;
    const subject = req.body.subject;
    const fromEmail = req.body.from_email || req.body.fromEmail;
    const attachment = req.body.attachment || req.body.file;
    const reqFile = req.file;

    const result = await sendgridEmailSendService.sendEmail({
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      customerId: customerId ? parseInt(customerId, 10) : undefined,
      message,
      subject,
      fromEmail,
      attachment,
      reqFile,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err) {
    console.error('SendGrid email sending error:', err);
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// POST /email/invoice
// Body: { invoice_id: number }
const sendInvoiceEmail = async (req, res) => {
  try {
    const invoiceId = req.body.invoice_id || req.body.invoiceId;
    const result = await sendgridEmailSendService.sendInvoiceEmail({
      invoiceId: invoiceId ? parseInt(invoiceId, 10) : undefined,
    });
    return res.status(200).json({
      success: true,
      message: 'The Invoice has been sent to the customer.',
      data: result,
    });
  } catch (err) {
    console.error('Invoice email sending error:', err.message);
    return res.status(err.status || 400).json({ success: false, error: err.message });
  }
};

// POST /email/quotation
// Body: { quotation_id: number }
const sendQuotationEmail = async (req, res) => {
  try {
    const quotationId = req.body.quotation_id || req.body.quotationId;
    const result = await sendgridEmailSendService.sendQuotationEmail({
      quotationId: quotationId ? parseInt(quotationId, 10) : undefined,
    });
    return res.status(200).json({
      success: true,
      message: 'The Quotation has been sent to the customer.',
      data: result,
    });
  } catch (err) {
    console.error('Quotation email sending error:', err.message);
    return res.status(err.status || 400).json({ success: false, error: err.message });
  }
};

module.exports = {
  sendEmail,
  sendInvoiceEmail,
  sendQuotationEmail,
};

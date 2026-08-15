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

module.exports = {
  sendEmail,
};

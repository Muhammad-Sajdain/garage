// src/controllers/smsController.js
const smsService = require('../services/twilioSmsSendService');

/**
 * POST /sms
 * Body: { message: string, company_id: number, customer_id: number }
 */
const sendSms = async (req, res) => {
  try {
    const { message, company_id, customer_id } = req.body;
    const result = await smsService.sendMessage({
      companyId: company_id,
      customerId: customer_id,
      message,
    });
    res.status(200).json({ success: true, sid: result.sid, status: result.status });
  } catch (err) {
    console.error('SMS sending error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

module.exports = { sendSms };

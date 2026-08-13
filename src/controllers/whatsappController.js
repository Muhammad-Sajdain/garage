// src/controllers/whatsappController.js
const whatsappService = require('../services/twilioWhatsappSendService');

/**
 * POST /whatsapp
 * Body: { message: string, company_id: number, customer_id: number }
 */
const sendWhatsapp = async (req, res) => {
  try {
    const { message, company_id, customer_id } = req.body;
    const result = await whatsappService.sendMessage({
      message,
      company_id,
      customer_id,
    });
    res.status(200).json({ success: true, sid: result.sid, status: result.status });
  } catch (err) {
    console.error('WhatsApp sending error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

module.exports = { sendWhatsapp };

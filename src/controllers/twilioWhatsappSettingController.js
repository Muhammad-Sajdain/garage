// src/controllers/twilioWhatsappSettingController.js
const twilioWhatsappSettingService = require('../services/twilioWhatsappSettingService');

// POST /twilio-whatsapp-settings
const createSetting = async (req, res) => {
  try {
    const setting = await twilioWhatsappSettingService.createSetting(req.body);
    res.status(201).json(setting);
  } catch (err) {
    console.error('Create Twilio WhatsApp setting error:', err);
    res.status(400).json({ error: err.message });
  }
};

// GET /twilio-whatsapp-settings/:id
const getSetting = async (req, res) => {
  try {
    const setting = await twilioWhatsappSettingService.getSettingById(req.params.id);
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch (err) {
    console.error('Get Twilio WhatsApp setting error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /twilio-whatsapp-settings
const listSettings = async (req, res) => {
  try {
    const settings = await twilioWhatsappSettingService.listSettings(req.query);
    res.json(settings);
  } catch (err) {
    console.error('List Twilio WhatsApp settings error:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /twilio-whatsapp-settings/:id
const updateSetting = async (req, res) => {
  try {
    const setting = await twilioWhatsappSettingService.updateSetting(req.params.id, req.body);
    res.json(setting);
  } catch (err) {
    console.error('Update Twilio WhatsApp setting error:', err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE /twilio-whatsapp-settings/:id (soft delete)
const deleteSetting = async (req, res) => {
  try {
    const result = await twilioWhatsappSettingService.deleteSetting(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('Delete Twilio WhatsApp setting error:', err);
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createSetting,
  getSetting,
  listSettings,
  updateSetting,
  deleteSetting,
};

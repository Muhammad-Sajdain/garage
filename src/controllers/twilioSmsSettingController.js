// src/controllers/twilioSmsSettingController.js
const twilioSmsSettingService = require('../services/twilioSmsSettingService');

// POST /twilio-sms-settings
const createSetting = async (req, res) => {
  try {
    const setting = await twilioSmsSettingService.createSetting(req.body);
    res.status(201).json(setting);
  } catch (err) {
    console.error('Create Twilio SMS Setting error:', err);
    res.status(400).json({ error: err.message });
  }
};

// GET /twilio-sms-settings/:id
const getSetting = async (req, res) => {
  try {
    const setting = await twilioSmsSettingService.getSettingById(req.params.id);
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch (err) {
    console.error('Get Twilio SMS Setting error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /twilio-sms-settings
const listSettings = async (req, res) => {
  try {
    const settings = await twilioSmsSettingService.listSettings(req.query);
    res.json(settings);
  } catch (err) {
    console.error('List Twilio SMS Settings error:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /twilio-sms-settings/:id
const updateSetting = async (req, res) => {
  try {
    const setting = await twilioSmsSettingService.updateSetting(req.params.id, req.body);
    res.json(setting);
  } catch (err) {
    console.error('Update Twilio SMS Setting error:', err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE /twilio-sms-settings/:id (soft delete)
const deleteSetting = async (req, res) => {
  try {
    const result = await twilioSmsSettingService.deleteSetting(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('Delete Twilio SMS Setting error:', err);
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

// src/controllers/sendgridSettingController.js
const sendgridSettingService = require('../services/sendgridSettingService');

// POST /sendgrid-settings
const createSetting = async (req, res) => {
  try {
    const setting = await sendgridSettingService.createSetting(req.body);
    res.status(201).json(setting);
  } catch (err) {
    console.error('Create SendGrid setting error:', err);
    res.status(400).json({ error: err.message });
  }
};

// GET /sendgrid-settings/:id
const getSetting = async (req, res) => {
  try {
    const setting = await sendgridSettingService.getSettingById(req.params.id);
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch (err) {
    console.error('Get SendGrid setting error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /sendgrid-settings
const listSettings = async (req, res) => {
  try {
    const settings = await sendgridSettingService.listSettings(req.query);
    res.json(settings);
  } catch (err) {
    console.error('List SendGrid settings error:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /sendgrid-settings/:id
const updateSetting = async (req, res) => {
  try {
    const setting = await sendgridSettingService.updateSetting(req.params.id, req.body);
    res.json(setting);
  } catch (err) {
    console.error('Update SendGrid setting error:', err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE /sendgrid-settings/:id (soft delete)
const deleteSetting = async (req, res) => {
  try {
    const result = await sendgridSettingService.deleteSetting(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('Delete SendGrid setting error:', err);
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

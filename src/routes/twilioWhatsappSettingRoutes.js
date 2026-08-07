// src/routes/twilioWhatsappSettingRoutes.js
const express = require('express');
const router = express.Router();
const twilioWhatsappSettingController = require('../controllers/twilioWhatsappSettingController');

// Create
router.post('/', twilioWhatsappSettingController.createSetting);

// Get by ID
router.get('/:id', twilioWhatsappSettingController.getSetting);

// List
router.get('/', twilioWhatsappSettingController.listSettings);

// Update
router.put('/:id', twilioWhatsappSettingController.updateSetting);

// Soft delete
router.delete('/:id', twilioWhatsappSettingController.deleteSetting);

module.exports = router;

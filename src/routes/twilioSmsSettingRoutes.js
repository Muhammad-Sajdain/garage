// src/routes/twilioSmsSettingRoutes.js
const express = require('express');
const router = express.Router();
const twilioSmsSettingController = require('../controllers/twilioSmsSettingController');

// Create a new Twilio SMS setting
router.post('/', twilioSmsSettingController.createSetting);

// Retrieve a setting by ID
router.get('/:id', twilioSmsSettingController.getSetting);

// List settings with optional query parameters
router.get('/', twilioSmsSettingController.listSettings);

// Update a setting by ID
router.put('/:id', twilioSmsSettingController.updateSetting);

// Soft delete a setting by ID
router.delete('/:id', twilioSmsSettingController.deleteSetting);

module.exports = router;

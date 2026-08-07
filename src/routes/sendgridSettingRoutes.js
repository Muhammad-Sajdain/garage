// src/routes/sendgridSettingRoutes.js
const express = require('express');
const router = express.Router();
const sendgridSettingController = require('../controllers/sendgridSettingController');

// Create a new SendGrid setting
router.post('/', sendgridSettingController.createSetting);

// Retrieve a setting by ID
router.get('/:id', sendgridSettingController.getSetting);

// List settings with optional query parameters
router.get('/', sendgridSettingController.listSettings);

// Update a setting by ID
router.put('/:id', sendgridSettingController.updateSetting);

// Soft delete a setting by ID
router.delete('/:id', sendgridSettingController.deleteSetting);

module.exports = router;

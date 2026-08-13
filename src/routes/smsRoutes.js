// src/routes/smsRoutes.js
const express = require('express');
const smsController = require('../controllers/smsController');

const router = express.Router();

// POST /sms
router.post('/', smsController.sendSms);

module.exports = router;

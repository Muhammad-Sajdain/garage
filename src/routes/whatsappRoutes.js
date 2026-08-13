// src/routes/whatsappRoutes.js
const express = require('express');
const whatsappController = require('../controllers/whatsappController');

const router = express.Router();

// POST /whatsapp
router.post('/', whatsappController.sendWhatsapp);

module.exports = router;

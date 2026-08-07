// src/routes/invoicePaymentRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const invoicePaymentController = require('../controllers/invoicePaymentController');

// Configure multer storage for payment proof images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve('uploads', 'payment_proof_images'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '_' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({ storage });

router.post('/', upload.single('picture'), invoicePaymentController.createPayment);
router.get('/:id', invoicePaymentController.getPayment);
router.get('/', invoicePaymentController.listPayments);
router.put('/:id', upload.single('picture'), invoicePaymentController.updatePayment);
router.delete('/:id', invoicePaymentController.deletePayment);

module.exports = router;

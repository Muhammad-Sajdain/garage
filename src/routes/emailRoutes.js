// src/routes/emailRoutes.js
const express = require('express');
const multer = require('multer');
const emailController = require('../controllers/emailController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = express.Router();

// Middleware helper to handle optional file uploads for attachment / file field
const optionalUpload = (req, res, next) => {
  upload.fields([
    { name: 'attachment', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (req.files) {
      if (req.files.attachment && req.files.attachment[0]) {
        req.file = req.files.attachment[0];
      } else if (req.files.file && req.files.file[0]) {
        req.file = req.files.file[0];
      }
    }
    next();
  });
};

// POST /email and POST /send-email
router.post('/', optionalUpload, emailController.sendEmail);

module.exports = router;

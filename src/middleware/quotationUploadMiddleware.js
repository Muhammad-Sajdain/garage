// src/middleware/quotationUploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/quotations_files');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Preserve the supplied filename for both disk storage and the database.
    // basename prevents a crafted filename from escaping the upload directory.
    const originalName = path.basename(file.originalname);
    cb(null, originalName);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept any file type (documents). You can add restrictions if needed.
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

module.exports = upload;

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const originalDir = path.join(__dirname, '../../uploads/original_company_logo');
const webpDir = path.join(__dirname, '../../uploads/company_logo');

if (!fs.existsSync(originalDir)) {
  fs.mkdirSync(originalDir, { recursive: true });
}

if (!fs.existsSync(webpDir)) {
  fs.mkdirSync(webpDir, { recursive: true });
}

// Multer disk storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, originalDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter (only allow images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;

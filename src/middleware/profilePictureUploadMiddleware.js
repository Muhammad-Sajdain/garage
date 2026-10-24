'use strict';

const multer = require('multer');
const fs = require('fs');
const path = require('path');

const originalDir = path.resolve(__dirname, '../../uploads/original-profile-pictures');
fs.mkdirSync(originalDir, { recursive: true });
fs.mkdirSync(path.resolve(__dirname, '../../uploads/profile-pictures'), { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, originalDir),
  filename: (_req, file, callback) => {
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${suffix}${path.extname(file.originalname).toLowerCase()}`);
  },
});

module.exports = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return callback(null, true);
    callback(new Error('Profile picture must be a JPG, PNG, or WebP image.'));
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

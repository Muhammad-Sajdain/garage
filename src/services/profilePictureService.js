'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const uploadRoot = path.resolve(__dirname, '../../uploads');
const profileDir = path.join(uploadRoot, 'profile-pictures');
const originalDir = path.join(uploadRoot, 'original-profile-pictures');

const saveProfilePicture = async (file) => {
  if (!file) return null;
  const filename = `${path.basename(file.filename, path.extname(file.filename))}.webp`;
  const destination = path.join(profileDir, filename);
  try {
    await sharp(file.path).rotate().resize(512, 512, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(destination);
    return filename;
  } catch (error) {
    removeProfilePicture(file.filename);
    throw error;
  }
};

const removeProfilePicture = (filename) => {
  if (!filename) return;
  const baseName = path.basename(filename, path.extname(filename));
  const webpPath = path.join(profileDir, `${baseName}.webp`);
  if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath);
  for (const original of fs.readdirSync(originalDir)) {
    if (path.basename(original, path.extname(original)) === baseName) {
      fs.unlinkSync(path.join(originalDir, original));
    }
  }
};

const removeUploadedFile = (file) => {
  if (!file?.filename) return;
  const originalPath = path.join(originalDir, path.basename(file.filename));
  if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
  const processedPath = path.join(profileDir, `${path.basename(file.filename, path.extname(file.filename))}.webp`);
  if (fs.existsSync(processedPath)) fs.unlinkSync(processedPath);
};

module.exports = { saveProfilePicture, removeProfilePicture, removeUploadedFile };

// src/routes/vehicleMaintenancePictureRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const vehicleMaintenancePictureController = require('../controllers/vehicleMaintenancePictureController');

// Multer storage for maintenance pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve('uploads', 'vehicle_maintenance_pictures'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '_' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({ storage });

// POST – multiple files (field name "pictures")
router.post('/', upload.array('pictures'), vehicleMaintenancePictureController.createPicture);
router.get('/', vehicleMaintenancePictureController.listPictures);
router.get('/:id', vehicleMaintenancePictureController.getPicture);
router.put('/:id', upload.array('pictures'), vehicleMaintenancePictureController.updatePicture);
router.delete('/:id', vehicleMaintenancePictureController.deletePicture);

module.exports = router;

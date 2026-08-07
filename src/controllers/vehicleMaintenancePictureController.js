// src/controllers/vehicleMaintenancePictureController.js
const vehicleMaintenancePictureService = require('../services/vehicleMaintenancePictureService');

// POST /vehicle-maintenance-pictures (multipart, multiple files)
const createPicture = async (req, res) => {
  try {
    const result = await vehicleMaintenancePictureService.create(req.body, req.files);
    res.status(201).json(result);
  } catch (err) {
    console.error('Create vehicle maintenance picture error:', err);
    res.status(400).json({ error: err.message });
  }
};

// GET /vehicle-maintenance-pictures/:id
const getPicture = async (req, res) => {
  try {
    const picture = await vehicleMaintenancePictureService.getById(req.params.id);
    if (!picture) return res.status(404).json({ error: 'Not found' });
    res.json(picture);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /vehicle-maintenance-pictures (list with filters)
const listPictures = async (req, res) => {
  try {
    const pictures = await vehicleMaintenancePictureService.list(req.query);
    res.json(pictures);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /vehicle-maintenance-pictures/:id (optional new files)
const updatePicture = async (req, res) => {
  try {
    const updated = await vehicleMaintenancePictureService.update(req.params.id, req.body, req.files);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE /vehicle-maintenance-pictures/:id (soft delete)
const deletePicture = async (req, res) => {
  try {
    const result = await vehicleMaintenancePictureService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

module.exports = { createPicture, getPicture, listPictures, updatePicture, deletePicture };

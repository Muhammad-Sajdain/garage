const insuredVehicleService = require('../services/insuredVehicleService');

const getInsuredVehicles = async (req, res) => {
  try {
    const insuredVehicles = await insuredVehicleService.listInsuredVehicles();
    res.json({ success: true, data: insuredVehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInsuredVehicle = async (req, res) => {
  try {
    const insuredVehicle = await insuredVehicleService.getInsuredVehicleById(req.params.id);
    if (!insuredVehicle) {
      return res.status(404).json({ success: false, message: 'InsuredVehicle not found' });
    }
    return res.json({ success: true, data: insuredVehicle });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createInsuredVehicle = async (req, res) => {
  try {
    const insuredVehicle = await insuredVehicleService.createInsuredVehicle(req.body);
    res.status(201).json({ success: true, data: insuredVehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateInsuredVehicle = async (req, res) => {
  try {
    const insuredVehicle = await insuredVehicleService.updateInsuredVehicle(req.params.id, req.body);
    res.json({ success: true, data: insuredVehicle });
  } catch (error) {
    if (error.message === 'InsuredVehicle not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteInsuredVehicle = async (req, res) => {
  try {
    const result = await insuredVehicleService.deleteInsuredVehicle(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'InsuredVehicle not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInsuredVehicles,
  getInsuredVehicle,
  createInsuredVehicle,
  updateInsuredVehicle,
  deleteInsuredVehicle,
};

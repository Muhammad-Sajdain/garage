const packageService = require('../services/packageService');

const getPackages = async (req, res) => {
  try {
    const packages = await packageService.listPackages();
    res.json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPackage = async (req, res) => {
  try {
    const packageRecord = await packageService.getPackageById(req.params.id);

    if (!packageRecord) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    return res.json({ success: true, data: packageRecord });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createPackage = async (req, res) => {
  try {
    const packageRecord = await packageService.createPackage(req.body);
    res.status(201).json({ success: true, data: packageRecord });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updatePackage = async (req, res) => {
  try {
    const packageRecord = await packageService.updatePackage(req.params.id, req.body);
    res.json({ success: true, data: packageRecord });
  } catch (error) {
    if (error.message === 'Package not found') {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(400).json({ success: false, message: error.message });
  }
};

const deletePackage = async (req, res) => {
  try {
    const result = await packageService.deletePackage(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'Package not found') {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
};

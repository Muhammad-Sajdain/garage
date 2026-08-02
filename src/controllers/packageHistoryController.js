const packageHistoryService = require('../services/packageHistoryService');

const getPackageHistories = async (req, res) => {
  try {
    const packageHistories = await packageHistoryService.listPackageHistories();
    res.json({ success: true, data: packageHistories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPackageHistory = async (req, res) => {
  try {
    const packageHistory = await packageHistoryService.getPackageHistoryById(req.params.id);
    if (!packageHistory) {
      return res.status(404).json({ success: false, message: 'PackageHistory not found' });
    }
    return res.json({ success: true, data: packageHistory });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createPackageHistory = async (req, res) => {
  try {
    const packageHistory = await packageHistoryService.createPackageHistory(req.body);
    res.status(201).json({ success: true, data: packageHistory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updatePackageHistory = async (req, res) => {
  try {
    const packageHistory = await packageHistoryService.updatePackageHistory(req.params.id, req.body);
    res.json({ success: true, data: packageHistory });
  } catch (error) {
    if (error.message === 'PackageHistory not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deletePackageHistory = async (req, res) => {
  try {
    const result = await packageHistoryService.deletePackageHistory(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'PackageHistory not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPackageHistories,
  getPackageHistory,
  createPackageHistory,
  updatePackageHistory,
  deletePackageHistory,
};

const moduleService = require('../services/moduleService');

const getModules = async (_req, res) => {
  try {
    res.json({ success: true, data: await moduleService.listModules() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getModule = async (req, res) => {
  try {
    const moduleRecord = await moduleService.getModuleById(req.params.id);
    if (!moduleRecord) return res.status(404).json({ success: false, message: 'Module not found' });
    return res.json({ success: true, data: moduleRecord });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createModule = async (req, res) => {
  try {
    res.status(201).json({ success: true, data: await moduleService.createModule(req.body) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateModule = async (req, res) => {
  try {
    res.json({ success: true, data: await moduleService.updateModule(req.params.id, req.body) });
  } catch (error) {
    return res.status(error.message === 'Module not found' ? 404 : 400).json({ success: false, message: error.message });
  }
};

const deleteModule = async (req, res) => {
  try {
    res.json(await moduleService.deleteModule(req.params.id));
  } catch (error) {
    return res.status(error.message === 'Module not found' ? 404 : 400).json({ success: false, message: error.message });
  }
};

module.exports = { getModules, getModule, createModule, updateModule, deleteModule };

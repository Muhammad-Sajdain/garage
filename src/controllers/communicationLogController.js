const service = require('../services/communicationLogService');

const listCommunicationLogs = async (req, res) => {
  try { res.json({ success: true, data: await service.listCommunicationLogs(req.query) }); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getCommunicationLog = async (req, res) => {
  try {
    const log = await service.getCommunicationLogById(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: 'Communication log not found' });
    return res.json({ success: true, data: log });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const createCommunicationLog = async (req, res) => {
  try { return res.status(201).json({ success: true, data: await service.createCommunicationLog(req.body) }); }
  catch (error) { return res.status(400).json({ success: false, message: error.message }); }
};

const updateCommunicationLog = async (req, res) => {
  try { return res.json({ success: true, data: await service.updateCommunicationLog(req.params.id, req.body) }); }
  catch (error) { return res.status(error.message === 'Communication log not found' ? 404 : 400).json({ success: false, message: error.message }); }
};

const deleteCommunicationLog = async (req, res) => {
  try { return res.json(await service.deleteCommunicationLog(req.params.id)); }
  catch (error) { return res.status(error.message === 'Communication log not found' ? 404 : 400).json({ success: false, message: error.message }); }
};

module.exports = { listCommunicationLogs, getCommunicationLog, createCommunicationLog, updateCommunicationLog, deleteCommunicationLog };

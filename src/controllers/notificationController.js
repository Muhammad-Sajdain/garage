const service = require('../services/notificationService');

const listNotifications = async (req, res) => {
  try { res.json({ success: true, data: await service.listNotifications(req.query) }); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
const getNotification = async (req, res) => {
  try {
    const notification = await service.getNotificationById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    return res.json({ success: true, data: notification });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};
const createNotification = async (req, res) => {
  try { return res.status(201).json({ success: true, data: await service.createNotification(req.body) }); }
  catch (error) { return res.status(400).json({ success: false, message: error.message }); }
};
const updateNotification = async (req, res) => {
  try { return res.json({ success: true, data: await service.updateNotification(req.params.id, req.body) }); }
  catch (error) { return res.status(error.message === 'Notification not found' ? 404 : 400).json({ success: false, message: error.message }); }
};
const deleteNotification = async (req, res) => {
  try { return res.json(await service.deleteNotification(req.params.id)); }
  catch (error) { return res.status(error.message === 'Notification not found' ? 404 : 400).json({ success: false, message: error.message }); }
};

module.exports = { listNotifications, getNotification, createNotification, updateNotification, deleteNotification };

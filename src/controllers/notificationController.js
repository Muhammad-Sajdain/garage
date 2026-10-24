const service = require('../services/notificationService');

const listNotifications = async (req, res) => {
  const user_id = Number(req.query.user_id);
  if (!Number.isInteger(user_id) || user_id <= 0) {
    return res.status(400).json({ success: false, message: 'A valid user_id is required.' });
  }
  try { res.json({ success: true, data: await service.listNotifications({ ...req.query, user_id }) }); }
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
const markAllNotificationsRead = async (req, res) => {
  const user_id = Number(req.body?.user_id);
  const scope = req.body?.scope;
  if (!Number.isInteger(user_id) || user_id <= 0) {
    return res.status(400).json({ success: false, message: 'A valid user_id is required.' });
  }
  if (scope !== undefined && !['system', 'customer'].includes(scope)) {
    return res.status(400).json({ success: false, message: 'Scope must be system or customer.' });
  }
  try {
    return res.json({ success: true, data: await service.markAllNotificationsRead(user_id, scope) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updateNotification = async (req, res) => {
  try { return res.json({ success: true, data: await service.updateNotification(req.params.id, req.body) }); }
  catch (error) { return res.status(error.message === 'Notification not found' ? 404 : 400).json({ success: false, message: error.message }); }
};
const deleteNotification = async (req, res) => {
  try { return res.json(await service.deleteNotification(req.params.id)); }
  catch (error) { return res.status(error.message === 'Notification not found' ? 404 : 400).json({ success: false, message: error.message }); }
};

module.exports = { listNotifications, getNotification, createNotification, markAllNotificationsRead, updateNotification, deleteNotification };

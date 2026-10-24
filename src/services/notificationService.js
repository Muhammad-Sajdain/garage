const db = require('../../models');

const getNotificationById = (id) => db.Notification.findByPk(id, {
  include: [{ model: db.Company, as: 'company' }, { model: db.Users, as: 'user' }],
});

const listNotifications = ({ company_id, user_id, scope, read, limit } = {}) => db.Notification.findAll({
  where: {
    ...(company_id !== undefined ? { company_id } : {}),
    ...(user_id !== undefined ? { user_id } : {}),
    ...(scope !== undefined ? { scope } : {}),
    ...(read !== undefined ? { read } : {}),
  },
  include: [{ model: db.Company, as: 'company' }, { model: db.Users, as: 'user' }],
  order: user_id !== undefined
    ? [['read', 'ASC'], ['createdAt', 'DESC']]
    : [['createdAt', 'DESC']],
  ...(limit !== undefined && Number.isInteger(Number(limit)) && Number(limit) > 0
    ? { limit: Number(limit) }
    : {}),
});

const createNotification = async (payload) => {
  const notification = await db.Notification.create({
    company_id: payload.company_id,
    user_id: payload.user_id,
    scope: payload.scope ?? 'system',
    text: payload.text,
    read: payload.read ?? 0,
  });
  return getNotificationById(notification.id);
};

const markAllNotificationsRead = async (user_id, scope) => {
  const [updatedCount] = await db.Notification.update(
    { read: 1 },
    { where: { user_id, read: 0, ...(scope !== undefined ? { scope } : {}) } },
  );
  return { updated: updatedCount };
};

const updateNotification = async (id, payload) => {
  const notification = await db.Notification.findByPk(id);
  if (!notification) throw new Error('Notification not found');
  const updateData = {};
  ['company_id', 'user_id', 'scope', 'text', 'read'].forEach((field) => {
    if (payload[field] !== undefined) updateData[field] = payload[field];
  });
  await notification.update(updateData);
  return getNotificationById(id);
};

const deleteNotification = async (id) => {
  const notification = await db.Notification.findByPk(id);
  if (!notification) throw new Error('Notification not found');
  await notification.destroy();
  return { success: true, message: 'Notification deleted successfully' };
};

module.exports = { listNotifications, getNotificationById, createNotification, markAllNotificationsRead, updateNotification, deleteNotification };

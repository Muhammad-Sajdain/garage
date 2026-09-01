const db = require('../../models');

const validateChannel = (channel) => {
  if (channel !== undefined && !['Email', 'WhatsApp', 'SMS'].includes(channel)) {
    throw new Error('channel must be Email, WhatsApp, or SMS');
  }
};

const getCommunicationLogById = (id) => db.CommunicationLog.findOne({
  where: { id, is_deleted: 0 },
  include: [{ model: db.Company, as: 'company' }, { model: db.Users, as: 'user' }],
});

const listCommunicationLogs = ({ company_id, channel, user_id } = {}) => db.CommunicationLog.findAll({
  where: {
    is_deleted: 0,
    ...(company_id !== undefined ? { company_id } : {}),
    ...(channel !== undefined ? { channel } : {}),
    ...(user_id !== undefined ? { user_id } : {}),
  },
  include: [{ model: db.Company, as: 'company' }, { model: db.Users, as: 'user' }],
  order: [['createdAt', 'DESC']],
});

const createCommunicationLog = async (payload) => {
  validateChannel(payload.channel);
  const log = await db.CommunicationLog.create({
    company_id: payload.company_id,
    channel: payload.channel,
    user_id: payload.user_id,
    status: payload.status ?? 1,
    is_deleted: 0,
  });
  return getCommunicationLogById(log.id);
};

const updateCommunicationLog = async (id, payload) => {
  const log = await db.CommunicationLog.findOne({ where: { id, is_deleted: 0 } });
  if (!log) throw new Error('Communication log not found');
  validateChannel(payload.channel);

  const updateData = {};
  ['company_id', 'channel', 'user_id', 'status'].forEach((field) => {
    if (payload[field] !== undefined) updateData[field] = payload[field];
  });
  await log.update(updateData);
  return getCommunicationLogById(id);
};

const deleteCommunicationLog = async (id) => {
  const log = await db.CommunicationLog.findOne({ where: { id, is_deleted: 0 } });
  if (!log) throw new Error('Communication log not found');
  await log.update({ is_deleted: 1 });
  return { success: true, message: 'Communication log deleted successfully' };
};

module.exports = { listCommunicationLogs, getCommunicationLogById, createCommunicationLog, updateCommunicationLog, deleteCommunicationLog };

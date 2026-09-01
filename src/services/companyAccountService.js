const db = require('../../models');

const getCompanyAccountById = (id) => db.CompanyAccount.findOne({
  where: { id, is_deleted: 0 },
  include: [{ model: db.Company, as: 'company' }],
});

const listCompanyAccounts = ({ company_id } = {}) => db.CompanyAccount.findAll({
  where: { is_deleted: 0, ...(company_id !== undefined ? { company_id } : {}) },
  include: [{ model: db.Company, as: 'company' }],
  order: [['id', 'ASC']],
});

const createCompanyAccount = async (payload) => {
  const account = await db.CompanyAccount.create({
    company_id: payload.company_id,
    current_amount: payload.current_amount ?? 0,
    status: payload.status ?? 1,
    is_deleted: 0,
  });
  return getCompanyAccountById(account.id);
};

const updateCompanyAccount = async (id, payload) => {
  const account = await db.CompanyAccount.findOne({ where: { id, is_deleted: 0 } });
  if (!account) throw new Error('Company account not found');

  const updateData = {};
  ['company_id', 'current_amount', 'status'].forEach((field) => {
    if (payload[field] !== undefined) updateData[field] = payload[field];
  });
  await account.update(updateData);
  return getCompanyAccountById(id);
};

const deleteCompanyAccount = async (id) => {
  const account = await db.CompanyAccount.findOne({ where: { id, is_deleted: 0 } });
  if (!account) throw new Error('Company account not found');
  await account.update({ is_deleted: 1 });
  return { success: true, message: 'Company account deleted successfully' };
};

module.exports = { listCompanyAccounts, getCompanyAccountById, createCompanyAccount, updateCompanyAccount, deleteCompanyAccount };

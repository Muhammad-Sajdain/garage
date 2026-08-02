const db = require('../../models');

const CompanyUser = db.CompanyUser;

const listCompanyUsers = async () => {
  return CompanyUser.findAll({
    where: { is_deleted: 0 },
    order: [['id', 'ASC']],
  });
};

const getCompanyUserById = async (id) => {
  return CompanyUser.findOne({
    where: { id, is_deleted: 0 },
  });
};

const createCompanyUser = async (payload) => {
  const { user_id, company_id, role_id, status = 1 } = payload;

  return CompanyUser.create({
    user_id,
    company_id,
    role_id,
    status,
    is_deleted: 0,
  });
};

const updateCompanyUser = async (id, payload) => {
  const companyUser = await CompanyUser.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!companyUser) {
    throw new Error('CompanyUser not found');
  }

  await companyUser.update(payload);
  return getCompanyUserById(id);
};

const deleteCompanyUser = async (id) => {
  const companyUser = await CompanyUser.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!companyUser) {
    throw new Error('CompanyUser not found');
  }

  await companyUser.update({ is_deleted: 1 });
  return { success: true, message: 'CompanyUser deleted successfully' };
};

module.exports = {
  listCompanyUsers,
  getCompanyUserById,
  createCompanyUser,
  updateCompanyUser,
  deleteCompanyUser,
};

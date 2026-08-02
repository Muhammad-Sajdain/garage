const db = require('../../models');

const Company = db.Company;
const CompanyUser = db.CompanyUser;

const listCompanies = async () => {
  return Company.findAll({
    where: { is_deleted: 0 },
    include: [{
      model: CompanyUser,
      as: 'companyUsers',
      where: { is_deleted: 0 },
      required: false,
    }],
    order: [['id', 'ASC']],
  });
};

const getCompanyById = async (id) => {
  return Company.findOne({
    where: { id, is_deleted: 0 },
    include: [{
      model: CompanyUser,
      as: 'companyUsers',
      where: { is_deleted: 0 },
      required: false,
    }],
  });
};

const createCompany = async (payload) => {
  const {
    owner_id,
    logo,
    email,
    country,
    phone,
    address,
    registration_no,
    status = 1,
  } = payload;

  const transaction = await db.sequelize.transaction();

  try {
    const company = await Company.create({
      owner_id,
      logo,
      email,
      country,
      phone,
      address,
      registration_no,
      status,
      is_deleted: 0,
    }, { transaction });

    await CompanyUser.create({
      user_id: owner_id,
      company_id: company.id,
      role_id: 1,
      status: 1,
      is_deleted: 0,
    }, { transaction });

    await transaction.commit();
    return company;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateCompany = async (id, payload) => {
  const company = await Company.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  await company.update(payload);
  return getCompanyById(id);
};

const deleteCompany = async (id) => {
  const company = await Company.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  await company.update({ is_deleted: 1 });
  return { success: true, message: 'Company deleted successfully' };
};

module.exports = {
  listCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};

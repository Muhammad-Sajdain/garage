const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const db = require('../../models');

const Company = db.Company;
const CompanyUser = db.CompanyUser;
const Users = db.Users;
const CompanyAccount = db.CompanyAccount;
const Role = db.Role;
const RolePermission = db.RolePermission;

const OWNER_ROLE_PERMISSIONS = {
  3: { view: true, create: true, update: true, deactivate: true, delete: true },
  4: { view: true, create: true, update: true, deactivate: true, delete: true },
  5: { view: true, create: false, update: false, deactivate: false, delete: false },
  16: { view: true, create: false, update: true, deactivate: false, delete: false },
  17: { view: true, create: false, update: true, deactivate: false, delete: false },
  18: { view: true, create: false, update: false, deactivate: false, delete: false },
  19: { view: true, create: false, update: false, deactivate: false, delete: false },
  20: { view: true, create: true, update: false, deactivate: false, delete: false },
  21: { view: true, create: true, update: true, deactivate: true, delete: true },
  22: { view: true, create: true, update: true, deactivate: true, delete: true },
  23: { view: true, create: true, update: true, deactivate: true, delete: true },
  24: { view: true, create: true, update: true, deactivate: true, delete: true },
  25: { view: true, create: true, update: true, deactivate: false, delete: true },
  26: { view: true, create: true, update: true, deactivate: true, delete: true },
  27: { view: true, create: false, update: false, deactivate: false, delete: false },
  28: { view: true, create: false, update: false, deactivate: false, delete: false },
  29: { view: true, create: true, update: true, deactivate: true, delete: true },
  30: { view: true, create: false, update: true, deactivate: false, delete: false },
  31: { view: true, create: true, update: true, deactivate: true, delete: true },
  32: { view: true, create: true, update: true, deactivate: true, delete: true },
  33: { view: true, create: true, update: true, deactivate: true, delete: true },
  34: { view: true, create: true, update: true, deactivate: true, delete: true },
};

const CUSTOMER_ROLE_PERMISSIONS = {
  1: { view: true, create: true, update: true, deactivate: true, delete: true },
  5: { view: false, create: false, update: false, deactivate: false, delete: false },
  16: { view: true, create: false, update: false, deactivate: false, delete: false },
  17: { view: true, create: false, update: false, deactivate: false, delete: false },
  18: { view: false, create: false, update: false, deactivate: false, delete: false },
  19: { view: false, create: false, update: false, deactivate: false, delete: false },
  20: { view: false, create: false, update: false, deactivate: false, delete: false },
  21: { view: true, create: false, update: false, deactivate: false, delete: false },
  22: { view: true, create: false, update: false, deactivate: false, delete: false },
  23: { view: true, create: false, update: false, deactivate: false, delete: false },
  24: { view: true, create: false, update: false, deactivate: false, delete: false },
  25: { view: true, create: false, update: false, deactivate: false, delete: false },
  26: { view: true, create: false, update: false, deactivate: false, delete: false },
  27: { view: true, create: false, update: false, deactivate: false, delete: false },
  28: { view: false, create: false, update: false, deactivate: false, delete: false },
  30: { view: true, create: false, update: false, deactivate: false, delete: false },
  31: { view: true, create: true, update: false, deactivate: false, delete: false },
  32: { view: true, create: true, update: false, deactivate: false, delete: false },
  33: { view: true, create: true, update: true, deactivate: true, delete: true },
  34: { view: true, create: true, update: true, deactivate: true, delete: true },
};

const companyIncludes = [
  {
    model: Users,
    as: 'owner',
    attributes: ['id', 'name'],
  },
  {
    model: CompanyUser,
    as: 'companyUsers',
    where: { is_deleted: 0 },
    required: false,
  },
];

const convertToWebp = async (file) => {
  const originalPath = file.path;
  const filenameWithoutExt = path.basename(file.filename, path.extname(file.filename));
  const webpFilename = `${filenameWithoutExt}.webp`;
  const webpPath = path.join(__dirname, '../../uploads/company_logo', webpFilename);

  await sharp(originalPath)
    .webp({ quality: 80 })
    .toFile(webpPath);

  return webpFilename;
};

const deleteCompanyLogoFiles = (logoFilename) => {
  if (!logoFilename) return;
  if (logoFilename.startsWith('http://') || logoFilename.startsWith('https://')) return;

  const webpPath = path.join(__dirname, '../../uploads/company_logo', logoFilename);
  try {
    if (fs.existsSync(webpPath)) {
      fs.unlinkSync(webpPath);
    }
  } catch (err) {
    console.error('Failed to delete webp logo file:', err.message);
  }

  try {
    const originalDir = path.join(__dirname, '../../uploads/original_company_logo');
    const uniqueSuffix = logoFilename.replace(/\.webp$/, '');
    if (fs.existsSync(originalDir)) {
      const files = fs.readdirSync(originalDir);
      const matchingFile = files.find(file => file.startsWith(uniqueSuffix));
      if (matchingFile) {
        fs.unlinkSync(path.join(originalDir, matchingFile));
      }
    }
  } catch (err) {
    console.error('Failed to delete original logo file:', err.message);
  }
};

const listCompanies = async () => {
  return Company.findAll({
    where: { is_deleted: 0 },
    include: companyIncludes,
    order: [['id', 'ASC']],
  });
};

const getCompanyById = async (id) => {
  return Company.findOne({
    where: { id, is_deleted: 0 },
    include: companyIncludes,
  });
};

const createCompany = async (payload, file) => {
  const {
    owner_id,
    name,
    email,
    country,
    phone,
    address,
    state,
    registration_no,
    status = 1,
  } = payload;

  let logoFilename = payload.logo || null;
  let newWebpFilename = null;

  if (file) {
    newWebpFilename = await convertToWebp(file);
    logoFilename = newWebpFilename;
  }

  const transaction = await db.sequelize.transaction();

  try {
    const company = await Company.create({
      owner_id,
      name,
      logo: logoFilename,
      email,
      country,
      state: state ?? '',
      phone,
      address,
      registration_no,
      status,
      is_deleted: 0,
    }, { transaction });

    const ownerRole = await Role.create({
      company_id: company.id,
      name: 'Owner',
      status: 1,
      is_deleted: 0,
    }, { transaction });

    const customerRole = await Role.create({
      company_id: company.id,
      name: 'Customer',
      status: 1,
      is_deleted: 0,
    }, { transaction });

    await RolePermission.bulkCreate([
      {
        role_id: ownerRole.id,
        permission: OWNER_ROLE_PERMISSIONS,
        status: 1,
        is_deleted: 0,
      },
      {
        role_id: customerRole.id,
        permission: CUSTOMER_ROLE_PERMISSIONS,
        status: 1,
        is_deleted: 0,
      },
    ], { transaction });

    await CompanyUser.create({
      user_id: owner_id,
      company_id: company.id,
      role_id: ownerRole.id,
      status: 1,
      is_deleted: 0,
    }, { transaction });

    await CompanyAccount.create({
      company_id: company.id,
      current_amount: 0,
      status: 1,
      is_deleted: 0,
    }, { transaction });

    await transaction.commit();
    return company;
  } catch (error) {
    await transaction.rollback();
    if (file && file.path) {
      try { fs.unlinkSync(file.path); } catch (e) {}
    }
    if (newWebpFilename) {
      const webpPath = path.join(__dirname, '../../uploads/company_logo', newWebpFilename);
      try { fs.unlinkSync(webpPath); } catch (e) {}
    }
    throw error;
  }
};

const updateCompany = async (id, payload, file) => {
  const company = await Company.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!company) {
    if (file && file.path) {
      try { fs.unlinkSync(file.path); } catch (e) {}
    }
    throw new Error('Company not found');
  }

  let oldLogoFilename = company.logo;
  let newWebpFilename = null;
  const shouldRemoveLogo = !file && (payload.logo === null || payload.remove_logo === 'true' || payload.remove_logo === true);

  if (shouldRemoveLogo) {
    payload.logo = null;
    delete payload.remove_logo;
  }

  if (file) {
    newWebpFilename = await convertToWebp(file);
    payload.logo = newWebpFilename;
  }

  const transaction = await db.sequelize.transaction();

  try {
    await company.update(payload, { transaction });
    await transaction.commit();

    if ((file || shouldRemoveLogo) && oldLogoFilename) {
      deleteCompanyLogoFiles(oldLogoFilename);
    }

    return getCompanyById(id);
  } catch (error) {
    await transaction.rollback();
    if (file && file.path) {
      try { fs.unlinkSync(file.path); } catch (e) {}
    }
    if (newWebpFilename) {
      const webpPath = path.join(__dirname, '../../uploads/company_logo', newWebpFilename);
      try { fs.unlinkSync(webpPath); } catch (e) {}
    }
    throw error;
  }
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

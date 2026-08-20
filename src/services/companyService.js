const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const db = require('../../models');

const Company = db.Company;
const CompanyUser = db.CompanyUser;

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

const createCompany = async (payload, file) => {
  const {
    owner_id,
    email,
    country,
    phone,
    address,
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
      logo: logoFilename,
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

  if (file) {
    newWebpFilename = await convertToWebp(file);
    payload.logo = newWebpFilename;
  }

  const transaction = await db.sequelize.transaction();

  try {
    await company.update(payload, { transaction });
    await transaction.commit();

    if (file && oldLogoFilename) {
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

const bcrypt = require('bcrypt');
const db = require('../../models');

const CompanyUser = db.CompanyUser;

const listCompanyUsers = async () => {
  return CompanyUser.findAll({
    where: { is_deleted: 0 },
    include: [
      {
        model: db.Users,
        as: 'user',
        where: { is_deleted: 0 },
        required: true,
      },
      {
        model: db.Company,
        as: 'company',
        where: { is_deleted: 0 },
        required: false,
      },
      {
        model: db.Role,
        as: 'role',
        where: { is_deleted: 0 },
        required: false,
      },
    ],
    order: [['id', 'ASC']],
  });
};

const getCompanyUserById = async (id) => {
  return CompanyUser.findOne({
    where: { id, is_deleted: 0 },
    include: [
      {
        model: db.Users,
        as: 'user',
        where: { is_deleted: 0 },
        required: true,
      },
      {
        model: db.Company,
        as: 'company',
        where: { is_deleted: 0 },
        required: false,
      },
      {
        model: db.Role,
        as: 'role',
        where: { is_deleted: 0 },
        required: false,
      },
    ],
  });
};

const createCompanyUser = async (payload) => {
  const transaction = await db.sequelize.transaction();
  try {
    const {
      name,
      country,
      email,
      password,
      phone,
      address,
      status = 1,
      company_id,
      role_id,
    } = payload;

    let user_id = payload.user_id;

    // If user details are provided, create the User first
    if (name || email || password) {
      if (!email || !password) {
        throw new Error('Email and password are required to create a user');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await db.Users.create(
        {
          name,
          country,
          email,
          password: hashedPassword,
          phone,
          address,
          status,
          is_deleted: 0,
        },
        { transaction }
      );
      user_id = user.id;
    }

    if (!user_id) {
      throw new Error('User ID is required, or user creation details must be provided');
    }

    const companyUser = await CompanyUser.create(
      {
        user_id,
        company_id,
        role_id,
        status: 1, // status: 1 for company user as requested
        is_deleted: 0,
      },
      { transaction }
    );

    await transaction.commit();
    return getCompanyUserById(companyUser.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateCompanyUser = async (id, payload) => {
  const companyUser = await CompanyUser.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!companyUser) {
    throw new Error('CompanyUser not found');
  }

  const transaction = await db.sequelize.transaction();
  try {
    const {
      name,
      country,
      email,
      password,
      phone,
      address,
      status,
      company_id,
      role_id,
    } = payload;

    // Update CompanyUser fields
    const companyUserUpdateData = {};
    if (company_id !== undefined) companyUserUpdateData.company_id = company_id;
    if (role_id !== undefined) companyUserUpdateData.role_id = role_id;
    if (status !== undefined) companyUserUpdateData.status = status;

    if (Object.keys(companyUserUpdateData).length > 0) {
      await companyUser.update(companyUserUpdateData, { transaction });
    }

    // Update associated User fields
    const userUpdateData = {};
    if (name !== undefined) userUpdateData.name = name;
    if (country !== undefined) userUpdateData.country = country;
    if (email !== undefined) userUpdateData.email = email;
    if (phone !== undefined) userUpdateData.phone = phone;
    if (address !== undefined) userUpdateData.address = address;
    if (status !== undefined) userUpdateData.status = status;
    if (password !== undefined) {
      userUpdateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(userUpdateData).length > 0) {
      await db.Users.update(userUpdateData, {
        where: { id: companyUser.user_id },
        transaction,
      });
    }

    await transaction.commit();
    return getCompanyUserById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteCompanyUser = async (id) => {
  const companyUser = await CompanyUser.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!companyUser) {
    throw new Error('CompanyUser not found');
  }

  const transaction = await db.sequelize.transaction();
  try {
    await companyUser.update({ is_deleted: 1 }, { transaction });

    await db.Users.update(
      { is_deleted: 1 },
      {
        where: { id: companyUser.user_id },
        transaction,
      }
    );

    await transaction.commit();
    return { success: true, message: 'CompanyUser deleted successfully' };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  listCompanyUsers,
  getCompanyUserById,
  createCompanyUser,
  updateCompanyUser,
  deleteCompanyUser,
};

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../models');

const Admin = db.Admin;
const Users = db.Users;
const CompanyUser = db.CompanyUser;
const Role = db.Role;
const Customer = db.Customer;

const JWT_SECRET = process.env.JWT_SECRET || 'garage-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const createToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const loginAdmin = async (payload) => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const admin = await Admin.findOne({
    where: { email, is_deleted: 0 },
  });

  if (!admin) {
    throw new Error('Invalid email or password');
  }

  let isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid && password === admin.password) {
    isPasswordValid = true;
  }

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = createToken({ sub: admin.id, id: admin.id, email: admin.email, role: 'SuperAdmin' });

  return {
    success: true,
    token,
    role: 'SuperAdmin',
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: 'SuperAdmin',
    },
  };
};

const loginUser = async (payload) => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const user = await Users.findOne({
    where: { email, is_deleted: 0 },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  let isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid && password === user.password) {
    isPasswordValid = true;
  }

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const companyUser = await CompanyUser.findOne({
    where: { user_id: user.id, is_deleted: 0 },
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['id', 'name'],
      },
    ],
  });

  const roleName = companyUser && companyUser.role ? companyUser.role.name : null;

  const token = createToken({
    sub: user.id,
    id: user.id,
    email: user.email,
    role: roleName,
    company_id: companyUser ? companyUser.company_id : null,
  });

  return {
    success: true,
    token,
    role: roleName,
    company_id: companyUser ? companyUser.company_id : null,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      country: user.country,
      phone: user.phone,
      address: user.address,
      role: roleName,
    },
  };
};

const loginCustomer = async (payload) => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const customer = await Customer.findOne({
    where: { email, is_deleted: 0 },
  });

  if (!customer) {
    throw new Error('Invalid email or password');
  }

  let isPasswordValid = await bcrypt.compare(password, customer.password);
  if (!isPasswordValid && password === customer.password) {
    isPasswordValid = true;
  }

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const role = 'Customer';
  const token = createToken({
    sub: customer.id,
    id: customer.id,
    email: customer.email,
    role,
    company_id: customer.company_id,
  });

  return {
    success: true,
    token,
    role,
    company_id: customer.company_id,
    user: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      role,
      company_id: customer.company_id,
    },
  };
};

module.exports = {
  hashPassword,
  loginAdmin,
  loginUser,
  loginCustomer,
};

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../models');

const Admin = db.Admin;
const Users = db.Users;
const CompanyUser = db.CompanyUser;
const Role = db.Role;
const RolePermission = db.RolePermission;
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

const parsePermission = (permission) => {
  if (!permission) return {};
  if (typeof permission === 'string') {
    try {
      return JSON.parse(permission);
    } catch {
      return {};
    }
  }
  return permission;
};

const getCompanyRoleAccess = async (roleId, companyId) => {
  if (!roleId || !companyId) return { role: null, permissions: {} };

  const role = await Role.findOne({
    where: { id: roleId, company_id: companyId, is_deleted: 0, status: 1 },
    attributes: ['id', 'name', 'company_id'],
  });
  if (!role) return { role: null, permissions: {} };

  const rolePermission = await RolePermission.findOne({
    where: { role_id: role.id, is_deleted: 0, status: 1 },
    order: [['id', 'DESC']],
  });

  return { role, permissions: parsePermission(rolePermission?.permission) };
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
    where: { user_id: user.id, is_deleted: 0, status: 1 },
    order: [['id', 'ASC']],
  });
  const companyId = companyUser?.company_id ?? null;
  const roleId = companyUser?.role_id ?? null;
  const { role, permissions } = await getCompanyRoleAccess(roleId, companyId);
  const roleName = role?.name ?? null;

  const token = createToken({
    sub: user.id,
    id: user.id,
    email: user.email,
    role: roleName,
    company_id: companyId,
    role_id: roleId,
    permissions,
  });

  return {
    success: true,
    token,
    role: roleName,
    company_id: companyId,
    role_id: roleId,
    permissions,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      country: user.country,
      phone: user.phone,
      address: user.address,
      role: roleName,
      role_id: roleId,
      permissions,
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

  let roleId = customer.role_id ?? null;
  if (!roleId && customer.company_id) {
    const customerRole = await Role.findOne({
      where: { company_id: customer.company_id, name: 'Customer', is_deleted: 0, status: 1 },
      attributes: ['id'],
    });
    roleId = customerRole?.id ?? null;
  }
  const { permissions } = await getCompanyRoleAccess(roleId, customer.company_id);
  const role = 'Customer';
  const token = createToken({
    sub: customer.id,
    id: customer.id,
    email: customer.email,
    role,
    company_id: customer.company_id,
    role_id: roleId,
    permissions,
  });

  return {
    success: true,
    token,
    role,
    company_id: customer.company_id,
    role_id: roleId,
    permissions,
    user: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      role,
      role_id: roleId,
      permissions,
      company_id: customer.company_id,
    },
  };
};

const changePassword = async (token, newPassword) => {
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters');
  }

  let claims;
  try {
    claims = jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error('Your session is invalid or has expired');
  }

  const userId = claims.sub || claims.id;
  let model = Users;
  if (claims.role === 'SuperAdmin') model = Admin;
  if (claims.role === 'Customer') model = Customer;

  const account = await model.findOne({ where: { id: userId, is_deleted: 0 } });
  if (!account) {
    throw new Error('Account not found');
  }

  await account.update({ password: await hashPassword(newPassword) });
  return { success: true, message: 'Password updated successfully' };
};

const updateProfile = async (token, payload) => {
  let claims;
  try {
    claims = jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error('Your session is invalid or has expired');
  }

  const userId = claims.sub || claims.id;
  let model = Users;
  let allowedFields = ['name', 'email', 'phone', 'address', 'country'];
  if (claims.role === 'SuperAdmin') {
    model = Admin;
    allowedFields = ['name', 'email', 'phone'];
  }
  if (claims.role === 'Customer') {
    model = Customer;
    allowedFields = ['name', 'email', 'phone', 'address'];
  }

  const account = await model.findOne({ where: { id: userId, is_deleted: 0 } });
  if (!account) {
    throw new Error('Account not found');
  }

  const updateData = Object.fromEntries(
    allowedFields
      .filter((field) => payload[field] !== undefined)
      .map((field) => [field, payload[field]])
  );
  await account.update(updateData);

  const profile = account.toJSON();
  delete profile.password;
  return { success: true, data: profile };
};

module.exports = {
  hashPassword,
  loginAdmin,
  loginUser,
  loginCustomer,
  changePassword,
  updateProfile,
};

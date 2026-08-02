const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../models');

const Admin = db.Admin;
const Users = db.Users;

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
  const admin = await Admin.findOne({
    where: { email, is_deleted: 0 },
  });

  if (!admin) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = createToken({ sub: admin.id, role: 'admin' });

  return {
    success: true,
    token,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
    },
  };
};

const loginUser = async (payload) => {
  const { email, password } = payload;
  const user = await Users.findOne({
    where: { email, is_deleted: 0 },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = createToken({ sub: user.id, role: 'user' });

  return {
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'user',
    },
  };
};

module.exports = {
  hashPassword,
  loginAdmin,
  loginUser,
};

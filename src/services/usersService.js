const bcrypt = require('bcrypt');
const db = require('../../models');

const Users = db.Users;

const listUsers = async () => {
  return Users.findAll({
    where: { is_deleted: 0 },
    order: [['id', 'ASC']],
  });
};

const getUserById = async (id) => {
  return Users.findOne({
    where: { id, is_deleted: 0 },
  });
};

const createUser = async (payload) => {
  const {
    name,
    country,
    email,
    password,
    phone,
    address,
    status = 1,
  } = payload;

  const hashedPassword = await bcrypt.hash(password, 10);

  return Users.create({
    name,
    country,
    email,
    password: hashedPassword,
    phone,
    address,
    status,
    is_deleted: 0,
  });
};

const updateUser = async (id, payload) => {
  const user = await Users.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const updateData = { ...payload };

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  await user.update(updateData);
  return getUserById(id);
};

const deleteUser = async (id) => {
  const user = await Users.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!user) {
    throw new Error('User not found');
  }

  await user.update({ is_deleted: 1 });
  return { success: true, message: 'User deleted successfully' };
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

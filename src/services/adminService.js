const bcrypt = require('bcrypt');
const db = require('../../models');

const Admin = db.Admin;

const listAdmins = async () => {
  return Admin.findAll({
    where: { is_deleted: 0 },
    order: [['id', 'ASC']],
  });
};

const getAdminById = async (id) => {
  return Admin.findOne({
    where: { id, is_deleted: 0 },
  });
};

const createAdmin = async (payload) => {
  const { name, email, password, phone, status = 1 } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);

  return Admin.create({
    name,
    email,
    password: hashedPassword,
    phone,
    status,
    is_deleted: 0,
  });
};

const updateAdmin = async (id, payload) => {
  const admin = await Admin.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!admin) {
    throw new Error('Admin not found');
  }

  const updateData = { ...payload };

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  await admin.update(updateData);
  return getAdminById(id);
};

const deleteAdmin = async (id) => {
  const admin = await Admin.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!admin) {
    throw new Error('Admin not found');
  }

  await admin.update({ is_deleted: 1 });
  return { success: true, message: 'Admin deleted successfully' };
};

module.exports = {
  listAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};

const db = require('../../models');

const Role = db.Role;

const listRoles = async () => {
  return Role.findAll({
    where: { is_deleted: 0 },
    order: [['id', 'ASC']],
  });
};

const getRoleById = async (id) => {
  return Role.findOne({
    where: { id, is_deleted: 0 },
  });
};

const createRole = async (payload) => {
  const { name, status = 1 } = payload;

  return Role.create({
    name,
    status,
    is_deleted: 0,
  });
};

const updateRole = async (id, payload) => {
  const role = await Role.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!role) {
    throw new Error('Role not found');
  }

  await role.update(payload);
  return getRoleById(id);
};

const deleteRole = async (id) => {
  const role = await Role.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!role) {
    throw new Error('Role not found');
  }

  await role.update({ is_deleted: 1 });
  return { success: true, message: 'Role deleted successfully' };
};

module.exports = {
  listRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};

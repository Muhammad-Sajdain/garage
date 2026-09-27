const db = require('../../models');

const Role = db.Role;
const RolePermission = db.RolePermission;

const normalizeCompanyId = (companyId) => {
  const normalizedCompanyId = Number(companyId);
  if (!Number.isInteger(normalizedCompanyId) || normalizedCompanyId <= 0) {
    throw new Error('company_id is required and must be a positive number');
  }
  return normalizedCompanyId;
};

const listRoles = async (companyId) => {
  const normalizedCompanyId = normalizeCompanyId(companyId);

  return Role.findAll({
    where: { is_deleted: 0, company_id: normalizedCompanyId },
    order: [['id', 'ASC']],
  });
};

const getRoleById = async (id, companyId) => {
  return Role.findOne({
    where: { id, company_id: normalizeCompanyId(companyId), is_deleted: 0 },
  });
};

const createRole = async (payload) => {
  const { company_id, name, status = 1 } = payload;
  const normalizedCompanyId = normalizeCompanyId(company_id);

  return Role.create({
    company_id: normalizedCompanyId,
    name,
    status,
    is_deleted: 0,
  });
};

const updateRole = async (id, payload) => {
  const companyId = normalizeCompanyId(payload.company_id);
  const role = await Role.findOne({
    where: { id, company_id: companyId, is_deleted: 0 },
  });

  if (!role) {
    throw new Error('Role not found');
  }

  // A role always remains with the company it was created for.
  const { company_id, ...updatableFields } = payload;
  await role.update(updatableFields);
  return getRoleById(id, companyId);
};

const deleteRole = async (id, companyId) => {
  const role = await Role.findOne({
    where: { id, company_id: normalizeCompanyId(companyId), is_deleted: 0 },
  });

  if (!role) {
    throw new Error('Role not found');
  }

  await role.update({ is_deleted: 1 });
  return { success: true, message: 'Role deleted successfully' };
};

const normalizePermissions = (permissions) => {
  if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions)) {
    throw new Error('permissions must be an object keyed by sub module ID');
  }

  const validActions = ['view', 'create', 'update', 'deactivate', 'delete'];
  return Object.fromEntries(Object.entries(permissions).map(([subModuleId, actions]) => [
    subModuleId,
    Object.fromEntries(validActions.map((action) => [action, Boolean(actions?.[action])])),
  ]));
};

const getRolePermissions = async (id, companyId) => {
  const role = await getRoleById(id, companyId);
  if (!role) throw new Error('Role not found');

  const rolePermission = await RolePermission.findOne({
    where: { role_id: role.id, is_deleted: 0 },
    order: [['id', 'DESC']],
  });

  const storedPermission = rolePermission?.permission ?? {};
  const permission = typeof storedPermission === 'string'
    ? JSON.parse(storedPermission)
    : storedPermission;

  return { role_id: role.id, permission };
};

const saveRolePermissions = async (id, companyId, permissions) => {
  const role = await getRoleById(id, companyId);
  if (!role) throw new Error('Role not found');
  const permission = normalizePermissions(permissions);

  const existing = await RolePermission.findOne({
    where: { role_id: role.id, is_deleted: 0 },
    order: [['id', 'DESC']],
  });

  if (existing) {
    await existing.update({ permission, status: 1 });
  } else {
    await RolePermission.create({ role_id: role.id, permission, status: 1, is_deleted: 0 });
  }

  return getRolePermissions(role.id, companyId);
};

module.exports = {
  listRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  saveRolePermissions,
};

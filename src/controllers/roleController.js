const roleService = require('../services/roleService');

// `selectedCompanyId` is accepted for clients that send the UI state directly;
// `company_id` remains the persisted/API field name.
const getCompanyId = (req) =>
  req.body?.company_id ?? req.body?.selectedCompanyId ?? req.query.company_id ?? req.query.selectedCompanyId;

const getRoles = async (req, res) => {
  try {
    const roles = await roleService.listRoles(getCompanyId(req));
    res.json({ success: true, data: roles });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getRole = async (req, res) => {
  try {
    const role = await roleService.getRoleById(req.params.id, getCompanyId(req));
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    return res.json({ success: true, data: role });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const createRole = async (req, res) => {
  try {
    const role = await roleService.createRole({ ...req.body, company_id: getCompanyId(req) });
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const role = await roleService.updateRole(req.params.id, { ...req.body, company_id: getCompanyId(req) });
    res.json({ success: true, data: role });
  } catch (error) {
    if (error.message === 'Role not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const result = await roleService.deleteRole(req.params.id, getCompanyId(req));
    res.json(result);
  } catch (error) {
    if (error.message === 'Role not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getRolePermissions = async (req, res) => {
  try {
    const permissions = await roleService.getRolePermissions(req.params.id, getCompanyId(req));
    return res.json({ success: true, data: permissions });
  } catch (error) {
    return res.status(error.message === 'Role not found' ? 404 : 400).json({ success: false, message: error.message });
  }
};

const saveRolePermissions = async (req, res) => {
  try {
    const permissions = await roleService.saveRolePermissions(req.params.id, getCompanyId(req), req.body.permissions);
    return res.json({ success: true, data: permissions });
  } catch (error) {
    return res.status(error.message === 'Role not found' ? 404 : 400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  saveRolePermissions,
};

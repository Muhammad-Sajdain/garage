const companyUserService = require('../services/companyUserService');

const getCompanyUsers = async (req, res) => {
  try {
    const { company_id } = req.query;
    if (!company_id) {
      return res.status(400).json({ success: false, message: 'company_id query parameter is required' });
    }

    const companyUsers = await companyUserService.listCompanyUsers(company_id);
    res.json({ success: true, data: companyUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCompanyUser = async (req, res) => {
  try {
    const companyUser = await companyUserService.getCompanyUserById(req.params.id);
    if (!companyUser) {
      return res.status(404).json({ success: false, message: 'CompanyUser not found' });
    }
    return res.json({ success: true, data: companyUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createCompanyUser = async (req, res) => {
  try {
    const companyUser = await companyUserService.createCompanyUser(req.body);
    res.status(201).json({ success: true, data: companyUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateCompanyUser = async (req, res) => {
  try {
    const companyUser = await companyUserService.updateCompanyUser(req.params.id, req.body);
    res.json({ success: true, data: companyUser });
  } catch (error) {
    if (error.message === 'CompanyUser not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteCompanyUser = async (req, res) => {
  try {
    const result = await companyUserService.deleteCompanyUser(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'CompanyUser not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCompanyUsers,
  getCompanyUser,
  createCompanyUser,
  updateCompanyUser,
  deleteCompanyUser,
};

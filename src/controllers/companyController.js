const companyService = require('../services/companyService');

const getCompanies = async (req, res) => {
  try {
    const companies = await companyService.listCompanies();
    res.json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCompany = async (req, res) => {
  try {
    const company = await companyService.getCompanyById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    return res.json({ success: true, data: company });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createCompany = async (req, res) => {
  try {
    const company = await companyService.createCompany(req.body);
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateCompany = async (req, res) => {
  try {
    const company = await companyService.updateCompany(req.params.id, req.body);
    res.json({ success: true, data: company });
  } catch (error) {
    if (error.message === 'Company not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const result = await companyService.deleteCompany(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'Company not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
};

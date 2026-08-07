const companyService = require('../services/companyService');

const formatCompanyLogoUrl = (req, company) => {
  if (!company) return company;

  const getLogoUrl = (logoName) => {
    if (!logoName) return null;
    if (logoName.startsWith('http://') || logoName.startsWith('https://')) {
      return logoName;
    }
    return `${req.protocol}://${req.get('host')}/company_logo/${logoName}`;
  };

  const companyJson = typeof company.toJSON === 'function' ? company.toJSON() : company;

  return {
    ...companyJson,
    logo: getLogoUrl(companyJson.logo),
  };
};

const getCompanies = async (req, res) => {
  try {
    const companies = await companyService.listCompanies();
    const formattedCompanies = companies.map(company => formatCompanyLogoUrl(req, company));
    res.json({ success: true, data: formattedCompanies });
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
    return res.json({ success: true, data: formatCompanyLogoUrl(req, company) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createCompany = async (req, res) => {
  try {
    const company = await companyService.createCompany(req.body, req.file);
    res.status(201).json({ success: true, data: formatCompanyLogoUrl(req, company) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateCompany = async (req, res) => {
  try {
    const company = await companyService.updateCompany(req.params.id, req.body, req.file);
    res.json({ success: true, data: formatCompanyLogoUrl(req, company) });
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

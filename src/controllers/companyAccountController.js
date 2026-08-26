const service = require('../services/companyAccountService');

const listCompanyAccounts = async (req, res) => {
  try { res.json({ success: true, data: await service.listCompanyAccounts(req.query) }); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
const getCompanyAccount = async (req, res) => {
  try {
    const account = await service.getCompanyAccountById(req.params.id);
    if (!account) return res.status(404).json({ success: false, message: 'Company account not found' });
    return res.json({ success: true, data: account });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};
const createCompanyAccount = async (req, res) => {
  try { res.status(201).json({ success: true, data: await service.createCompanyAccount(req.body) }); }
  catch (error) { res.status(400).json({ success: false, message: error.message }); }
};
const updateCompanyAccount = async (req, res) => {
  try { res.json({ success: true, data: await service.updateCompanyAccount(req.params.id, req.body) }); }
  catch (error) { res.status(error.message === 'Company account not found' ? 404 : 400).json({ success: false, message: error.message }); }
};
const deleteCompanyAccount = async (req, res) => {
  try { res.json(await service.deleteCompanyAccount(req.params.id)); }
  catch (error) { res.status(error.message === 'Company account not found' ? 404 : 400).json({ success: false, message: error.message }); }
};

module.exports = { listCompanyAccounts, getCompanyAccount, createCompanyAccount, updateCompanyAccount, deleteCompanyAccount };

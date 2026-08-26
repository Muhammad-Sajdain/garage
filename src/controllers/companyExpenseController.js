const service = require('../services/companyExpenseService');

const listCompanyExpenses = async (req, res) => {
  try { res.json({ success: true, data: await service.listCompanyExpenses(req.query) }); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
const getCompanyExpense = async (req, res) => {
  try {
    const expense = await service.getCompanyExpenseById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Company expense not found' });
    return res.json({ success: true, data: expense });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};
const createCompanyExpense = async (req, res) => {
  try { res.status(201).json({ success: true, data: await service.createCompanyExpense(req.body) }); }
  catch (error) { res.status(400).json({ success: false, message: error.message }); }
};
const updateCompanyExpense = async (req, res) => {
  try { res.json({ success: true, data: await service.updateCompanyExpense(req.params.id, req.body) }); }
  catch (error) { res.status(error.message === 'Company expense not found' ? 404 : 400).json({ success: false, message: error.message }); }
};
const deleteCompanyExpense = async (req, res) => {
  try { res.json(await service.deleteCompanyExpense(req.params.id)); }
  catch (error) { res.status(error.message === 'Company expense not found' ? 404 : 400).json({ success: false, message: error.message }); }
};

module.exports = { listCompanyExpenses, getCompanyExpense, createCompanyExpense, updateCompanyExpense, deleteCompanyExpense };

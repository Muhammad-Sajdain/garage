const service = require('../services/towingInvoiceService');

const listTowingInvoices = async (req, res) => {
  try {
    res.json({ success: true, data: await service.listTowingInvoices(req.query) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTowingInvoice = async (req, res) => {
  try {
    const invoice = await service.getTowingInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Towing invoice not found' });
    return res.json({ success: true, data: invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createTowingInvoice = async (req, res) => {
  try {
    const invoice = await service.createTowingInvoice(req.body);
    return res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateTowingInvoice = async (req, res) => {
  try {
    const invoice = await service.updateTowingInvoice(req.params.id, req.body);
    return res.json({ success: true, data: invoice });
  } catch (error) {
    return res.status(error.message === 'Towing invoice not found' ? 404 : 400).json({ success: false, message: error.message });
  }
};

const deleteTowingInvoice = async (req, res) => {
  try {
    const result = await service.deleteTowingInvoice(req.params.id);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(error.message === 'Towing invoice not found' ? 404 : 400).json({ success: false, message: error.message });
  }
};

module.exports = { listTowingInvoices, getTowingInvoice, createTowingInvoice, updateTowingInvoice, deleteTowingInvoice };

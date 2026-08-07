// src/controllers/invoiceController.js
const invoiceService = require('../services/invoiceService');

// POST /invoices
const createInvoice = async (req, res) => {
  try {
    const invoice = await invoiceService.createInvoice(req.body);
    res.status(201).json(invoice);
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(400).json({ error: err.message });
  }
};

// GET /invoices/:id
const getInvoice = async (req, res) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    console.error('Get invoice error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /invoices
const listInvoices = async (req, res) => {
  try {
    const invoices = await invoiceService.listInvoices(req.query);
    res.json(invoices);
  } catch (err) {
    console.error('List invoices error:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /invoices/:id
const updateInvoice = async (req, res) => {
  try {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
    res.json(invoice);
  } catch (err) {
    console.error('Update invoice error:', err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE /invoices/:id (soft delete)
const deleteInvoice = async (req, res) => {
  try {
    const result = await invoiceService.deleteInvoice(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('Delete invoice error:', err);
    res.status(400).json({ error: err.message });
  }
};

module.exports = { createInvoice, getInvoice, listInvoices, updateInvoice, deleteInvoice };

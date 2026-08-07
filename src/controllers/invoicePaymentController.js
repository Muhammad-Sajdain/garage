// src/controllers/invoicePaymentController.js
const invoicePaymentService = require('../services/invoicePaymentService');

// POST /invoice-payments (multipart/form-data with image)
const createPayment = async (req, res) => {
  try {
    const payment = await invoicePaymentService.createPayment(req.body, req.file);
    res.status(201).json(payment);
  } catch (err) {
    console.error('Create payment error:', err);
    res.status(400).json({ error: err.message });
  }
};

// GET /invoice-payments/:id
const getPayment = async (req, res) => {
  try {
    const payment = await invoicePaymentService.getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    console.error('Get payment error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /invoice-payments
const listPayments = async (req, res) => {
  try {
    const payments = await invoicePaymentService.listPayments(req.query);
    res.json(payments);
  } catch (err) {
    console.error('List payments error:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /invoice-payments/:id (multipart/form-data optional image)
const updatePayment = async (req, res) => {
  try {
    const payment = await invoicePaymentService.updatePayment(req.params.id, req.body, req.file);
    res.json(payment);
  } catch (err) {
    console.error('Update payment error:', err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE /invoice-payments/:id (soft delete)
const deletePayment = async (req, res) => {
  try {
    const result = await invoicePaymentService.deletePayment(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('Delete payment error:', err);
    res.status(400).json({ error: err.message });
  }
};

module.exports = { createPayment, getPayment, listPayments, updatePayment, deletePayment };

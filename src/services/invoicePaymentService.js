// src/services/invoicePaymentService.js
const path = require('path');
const fs = require('fs');
const db = require('../../models');
const { InvoicePayment, Invoice, Sales } = db;

// Helper to fetch a payment with its invoice association
const getPaymentById = async (id) => {
  return InvoicePayment.findOne({
    where: { id, is_deleted: 0 },
    include: [{ model: Invoice, as: 'invoice' }]
  });
};

// List payments (supports simple filter object)
const listPayments = async (filters = {}) => {
  const where = { is_deleted: 0, ...filters };
  return InvoicePayment.findAll({ where, include: [{ model: Invoice, as: 'invoice' }], order: [['id', 'ASC']] });
};

// Create a new payment record; `file` is the uploaded image (multer)
const createPayment = async (payload, file) => {
  const {
    company_id,
    invoice_id,
    total_amount,
    balance_amount,
    paid_amount,
    payment_method,
    payment_status,
    payment_done_by,
    created_by,
    verified_by = null,
    verifiedAt = null,
    is_deleted = 0
  } = payload;

  const picture = file ? file.filename : null;

  const payment = await InvoicePayment.create({
    company_id,
    invoice_id,
    total_amount,
    balance_amount,
    paid_amount,
    picture,
    payment_method,
    payment_status,
    payment_done_by,
    created_by,
    verified_by,
    verifiedAt,
    is_deleted,
    status: 1 // implicit active status
  });

  if (payment_status === 'verified') {
    await Sales.create({
      company_id,
      invoice_id,
      amount: paid_amount,
      status: 1,
      is_deleted: 0,
    });
  }

  if (Number(balance_amount) === 0) {
    await Invoice.update(
      { payment_status: 'completed' },
      { where: { id: invoice_id, is_deleted: 0 } },
    );
  }

  return getPaymentById(payment.id);
};

// Update a payment; optionally replace the picture
const updatePayment = async (id, payload, file) => {
  const payment = await InvoicePayment.findOne({ where: { id, is_deleted: 0 } });
  if (!payment) throw new Error('InvoicePayment not found');

  const {
    company_id, // immutable
    invoice_id, // immutable
    picture, // will be overridden if new file provided
    ...updatable
  } = payload;

  if (file) {
    // delete old file if exists
    if (payment.picture) {
      const oldPath = path.resolve('uploads', 'payment_proof_images', payment.picture);
      fs.unlink(oldPath, err => { /* ignore errors */ });
    }
    updatable.picture = file.filename;
  }

  await payment.update(updatable);
  return getPaymentById(id);
};

// Soft‑delete a payment; optionally remove picture file
const deletePayment = async (id) => {
  const payment = await InvoicePayment.findOne({ where: { id, is_deleted: 0 } });
  if (!payment) throw new Error('InvoicePayment not found');
  await payment.update({ is_deleted: 1 });
  // remove picture file if present
  if (payment.picture) {
    const picPath = path.resolve('uploads', 'payment_proof_images', payment.picture);
    fs.unlink(picPath, err => { /* ignore */ });
  }
  return { success: true, message: 'InvoicePayment deleted' };
};

module.exports = { listPayments, getPaymentById, createPayment, updatePayment, deletePayment };

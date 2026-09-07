// src/services/invoicePaymentService.js
const path = require('path');
const fs = require('fs');
const db = require('../../models');
const {
  InvoicePayment,
  Invoice,
  TowingInvoice,
  Sales,
  CompanyExpense,
  CompanyAccount,
} = db;

// Helper to fetch a payment with its invoice association
const getPaymentById = async (id) => {
  return InvoicePayment.findOne({
    where: { id, is_deleted: 0 },
    include: [{ model: Invoice, as: 'invoice' }]
  });
};

// List payments (supports simple filter object)
const listPayments = async ({ page, limit, dateField, startDate, endDate, ...filters } = {}) => {
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
    invoice_type,
    payment_status,
    payment_done_by,
    created_by,
    verified_by = null,
    verifiedAt = null,
    is_deleted = 0
  } = payload;

  const picture = file ? file.filename : null;
  if (!invoice_id) {
    throw new Error('invoice_id is required');
  }
  const resolvedInvoiceType = invoice_type ?? 'Service';
  if (!['Service', 'Towing Service'].includes(resolvedInvoiceType)) {
    throw new Error('invoice_type must be Service or Towing Service');
  }

  const transaction = await db.sequelize.transaction();
  try {
    const payment = await InvoicePayment.create({
      company_id,
      invoice_id,
      total_amount,
      balance_amount,
      paid_amount,
      picture,
      payment_method,
      invoice_type: resolvedInvoiceType,
      payment_status,
      payment_done_by,
      created_by,
      verified_by,
      verifiedAt,
      is_deleted,
      status: 1 // implicit active status
    }, { transaction });

    if (payment_status === 'verified') {
      const amount = Number(paid_amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('paid_amount must be greater than zero for a verified payment');
      }

      await Sales.create({
        company_id,
        invoice_id,
        invoice_type: resolvedInvoiceType,
        amount,
        status: 1,
        is_deleted: 0,
      }, { transaction });

      let account = await CompanyAccount.findOne({
        where: { company_id, status: 1, is_deleted: 0 },
        order: [['id', 'ASC']],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!account) {
        account = await CompanyAccount.create({
          company_id,
          current_amount: 0,
          status: 1,
          is_deleted: 0,
        }, { transaction });
      }

      const balance = Number(((Number(account.current_amount) || 0) + amount).toFixed(2));
      await CompanyExpense.create({
        company_id,
        transaction_type: 'Credit',
        reason: `Verified ${resolvedInvoiceType === 'Towing Service' ? 'towing invoice' : 'invoice'} payment for invoice #${invoice_id}`,
        amount,
        balance,
        created_by,
      }, { transaction });
      await account.update({ current_amount: balance }, { transaction });
    }

    if (Number(balance_amount) === 0) {
      const InvoiceModel = resolvedInvoiceType === 'Towing Service' ? TowingInvoice : Invoice;
      await InvoiceModel.update(
        { payment_status: 'completed' },
        { where: { id: invoice_id, is_deleted: 0 }, transaction },
      );
    }

    await transaction.commit();
    return getPaymentById(payment.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Update a payment; optionally replace the picture
const updatePayment = async (id, payload, file) => {
  const {
    company_id, // immutable
    invoice_id, // immutable
    picture, // will be overridden if new file provided
    ...updatable
  } = payload;

  const transaction = await db.sequelize.transaction();
  if (file) {
    updatable.picture = file.filename;
  }

  try {
    const payment = await InvoicePayment.findOne({
      where: { id, is_deleted: 0 },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!payment) throw new Error('InvoicePayment not found');

    const previousPicture = payment.picture;
    const wasVerified = payment.payment_status === 'verified';
    await payment.update(updatable, { transaction });

    if (!wasVerified && payment.payment_status === 'verified') {
      const amount = Number(payment.paid_amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('paid_amount must be greater than zero for a verified payment');
      }

      await Sales.create({
        company_id: payment.company_id,
        invoice_id: payment.invoice_id,
        invoice_type: payment.invoice_type,
        amount,
        status: 1,
        is_deleted: 0,
      }, { transaction });

      let account = await CompanyAccount.findOne({
        where: { company_id: payment.company_id, status: 1, is_deleted: 0 },
        order: [['id', 'ASC']],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!account) {
        account = await CompanyAccount.create({
          company_id: payment.company_id,
          current_amount: 0,
          status: 1,
          is_deleted: 0,
        }, { transaction });
      }

      const balance = Number(((Number(account.current_amount) || 0) + amount).toFixed(2));
      await CompanyExpense.create({
        company_id: payment.company_id,
        transaction_type: 'Credit',
        reason: `Verified ${payment.invoice_type === 'Towing Service' ? 'towing invoice' : 'invoice'} payment for invoice #${payment.invoice_id}`,
        amount,
        balance,
        created_by: payment.created_by,
      }, { transaction });
      await account.update({ current_amount: balance }, { transaction });
    }

    await transaction.commit();

    if (file && previousPicture) {
      const oldPath = path.resolve('uploads', 'payment_proof_images', previousPicture);
      fs.unlink(oldPath, () => { /* ignore errors */ });
    }

    return getPaymentById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
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

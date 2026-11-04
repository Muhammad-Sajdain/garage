// src/services/invoicePaymentService.js
const path = require('path');
const fs = require('fs');
const db = require('../../models');
const { Op } = require('sequelize');
const {
  InvoicePayment,
  Invoice,
  TowingInvoice,
  TaskCard,
  Quotation,
  Vehicle,
  Customer,
  Sales,
  CompanyExpense,
  CompanyAccount,
} = db;
const { refreshInvoicePaymentState, getPaymentSummaries, getInvoiceModel } = require('./invoiceBalanceService');
const {
  BALANCE_PAYMENT_STATUSES,
  VERIFIED_PAYMENT_STATUSES,
  determineVerificationStatus,
  toCents,
} = require('../utils/invoicePaymentBalance');

const paymentIncludes = [
  {
    model: Invoice,
    as: 'invoice',
    include: [{
      model: TaskCard,
      as: 'taskCard',
      include: [{
        model: Quotation,
        as: 'quotation',
        include: [{ model: Vehicle, as: 'vehicle', include: [{ model: Customer, as: 'customer' }] }],
      }],
    }],
  },
  {
    model: TowingInvoice,
    as: 'towingInvoice',
    include: [{ model: Vehicle, as: 'vehicle', include: [{ model: Customer, as: 'customer' }] }],
  },
];

const withInvoiceNumber = (payment) => {
  const record = payment.toJSON ? payment.toJSON() : payment;
  const sourceInvoice = record.invoice_type === 'Towing Service' ? record.towingInvoice : record.invoice;
  return {
    ...record,
    invoice_number: sourceInvoice?.invoice_number ?? null,
  };
};

const getInvoiceNumber = async ({ invoice_id, invoice_type, transaction }) => {
  const InvoiceModel = invoice_type === 'Towing Service' ? TowingInvoice : Invoice;
  const invoice = await InvoiceModel.findOne({
    where: { id: invoice_id, is_deleted: 0 },
    attributes: ['invoice_number'],
    transaction,
  });
  return invoice?.invoice_number ?? invoice_id;
};

// Helper to fetch a payment with its invoice association
const getPaymentById = async (id) => {
  const payment = await InvoicePayment.findOne({
    where: { id, is_deleted: 0 },
    include: paymentIncludes,
  });
  return payment ? withInvoiceNumber(payment) : null;
};

const notifyCustomerOfPaymentStatus = async (payment, status) => {
  if (!payment) return;
  const customerId = payment.invoice_type === 'Towing Service'
    ? payment.towingInvoice?.vehicle?.customer?.id ?? payment.towingInvoice?.vehicle?.customer_id
    : payment.invoice?.taskCard?.quotation?.vehicle?.customer?.id
      ?? payment.invoice?.taskCard?.quotation?.vehicle?.customer_id;
  if (!customerId) return;

  const amount = Number(payment.paid_amount);
  const formattedAmount = Number.isFinite(amount) ? amount.toFixed(2) : String(payment.paid_amount);
  const invoiceNumber = payment.invoice_number ?? payment.invoice_id;
  const formattedStatus = String(status).replace(/_/g, ' ').toLowerCase();
  try {
    await db.Notification.create({
      company_id: payment.company_id,
      user_id: customerId,
      scope: 'customer',
      text: `Your payment of $${formattedAmount} against invoice #${invoiceNumber} has been ${formattedStatus}.`,
      read: 0,
    });
  } catch (error) {
    // The payment has already been committed; don't report it as failed if its
    // separate customer notification cannot be recorded.
    console.error('Unable to create customer invoice payment notification:', error);
  }
};

const recordVerifiedPayment = async (payment, amount, transaction) => {
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
  const invoiceNumber = await getInvoiceNumber({
    invoice_id: payment.invoice_id,
    invoice_type: payment.invoice_type,
    transaction,
  });
  await CompanyExpense.create({
    company_id: payment.company_id,
    transaction_type: 'Credit',
    reason: `Verified ${payment.invoice_type === 'Towing Service' ? 'towing invoice' : 'invoice'} payment for invoice #${invoiceNumber}`,
    amount,
    balance,
    created_by: payment.created_by,
  }, { transaction });
  await account.update({ current_amount: balance }, { transaction });
};

// List payments (supports simple filter object)
const listPayments = async ({ page, limit, search, dateField, startDate, endDate, customer_id, status, ...filters } = {}) => {
  const where = { is_deleted: 0, ...filters };
  if (status && status !== 'all') {
    const allowedStatuses = ['pending', 'verified', 'verified_with_adjustment', 'rejected'];
    if (!allowedStatuses.includes(String(status).toLowerCase())) {
      throw new Error('Invalid invoice payment status filter');
    }
    where.payment_status = String(status).toLowerCase();
  }
  if (customer_id !== undefined) {
    const customerId = Number(customer_id);
    if (!Number.isInteger(customerId) || customerId <= 0) {
      throw new Error('customer_id must be a positive number');
    }
    where[Op.or] = [
      {
        invoice_type: 'Service',
        '$invoice.taskCard.quotation.vehicle.customer_id$': customerId,
      },
      {
        invoice_type: 'Towing Service',
        '$towingInvoice.vehicle.customer_id$': customerId,
      },
    ];
  }
  const payments = await InvoicePayment.findAll({ where, include: paymentIncludes, order: [['id', 'DESC']] });
  return payments.map(withInvoiceNumber);
};

// Create a new payment record; `file` is the uploaded image (multer)
const createPayment = async (payload, file) => {
  const {
    company_id,
    invoice_id,
    paid_amount,
    payment_method,
    invoice_type,
    payment_status,
    payment_done_by,
    created_by,
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
    const amount = Number(paid_amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('paid_amount must be greater than zero');
    }

    const InvoiceModel = getInvoiceModel(resolvedInvoiceType);
    const invoice = await InvoiceModel.findOne({
      where: { id: invoice_id, is_deleted: 0 },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!invoice) throw new Error('Invoice not found');

    const before = await getPaymentSummaries({ invoiceIds: [invoice_id], invoiceType: resolvedInvoiceType, transaction });
    const previousClaims = before.get(String(invoice_id))?.claimedAmount ?? 0;
    if (toCents(previousClaims + amount) > toCents(invoice.total)) {
      throw new Error('Paid amount cannot exceed the remaining invoice balance');
    }

    const resolvedPaymentStatus = String(payment_status ?? 'pending').toLowerCase();
    const payment = await InvoicePayment.create({
      company_id,
      invoice_id,
      total_amount: invoice.total,
      balance_amount: Math.max(0, Number((Number(invoice.total) - previousClaims - amount).toFixed(2))),
      paid_amount,
      picture,
      payment_method,
      invoice_type: resolvedInvoiceType,
      payment_status: resolvedPaymentStatus,
      payment_done_by,
      created_by,
      verified_by: payload.verified_by ?? null,
      verifiedAt: payload.verifiedAt ?? null,
      is_deleted,
      status: 1 // implicit active status
    }, { transaction });

    if (VERIFIED_PAYMENT_STATUSES.includes(resolvedPaymentStatus)) {
      await recordVerifiedPayment(payment, amount, transaction);
    }

    const balanceState = await refreshInvoicePaymentState({ invoiceId: invoice_id, invoiceType: resolvedInvoiceType, transaction });
    await payment.update({ balance_amount: balanceState.balance }, { transaction });

    await transaction.commit();
    const result = await getPaymentById(payment.id);
    if (payment_done_by === 'company' && VERIFIED_PAYMENT_STATUSES.includes(resolvedPaymentStatus)) {
      await notifyCustomerOfPaymentStatus(result, resolvedPaymentStatus);
    }
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Update a payment; optionally replace the picture
const updatePayment = async (id, payload, file, verifiedBy = null) => {
  const transaction = await db.sequelize.transaction();
  try {
    const existingPayment = await InvoicePayment.findOne({
      where: { id, is_deleted: 0 },
      transaction,
    });
    if (!existingPayment) throw new Error('InvoicePayment not found');

    const InvoiceModel = getInvoiceModel(existingPayment.invoice_type);
    const invoice = await InvoiceModel.findOne({
      where: { id: existingPayment.invoice_id, is_deleted: 0 },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!invoice) throw new Error('Invoice not found');

    const payment = await InvoicePayment.findOne({
      where: { id, is_deleted: 0 },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!payment) throw new Error('InvoicePayment not found');

    const previousPicture = payment.picture;
    const previousStatus = payment.payment_status;
    const wasVerified = VERIFIED_PAYMENT_STATUSES.includes(previousStatus);
    const previousAmount = Number(payment.paid_amount);
    const nextAmount = payload.paid_amount === undefined ? previousAmount : Number(payload.paid_amount);
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      throw new Error('paid_amount must be greater than zero');
    }

    const amountChanged = toCents(previousAmount) !== toCents(nextAmount);
    const requestedStatus = String(payload.payment_status ?? previousStatus).toLowerCase();
    if (wasVerified && amountChanged) {
      throw new Error('A verified payment amount cannot be changed');
    }
    if (wasVerified && requestedStatus !== previousStatus) {
      throw new Error('A verified payment status cannot be changed');
    }

    const nextStatus = VERIFIED_PAYMENT_STATUSES.includes(requestedStatus)
      ? wasVerified
        ? previousStatus
        : determineVerificationStatus(previousAmount, nextAmount)
      : requestedStatus;
    if (!['pending', 'rejected', ...VERIFIED_PAYMENT_STATUSES].includes(nextStatus)) {
      throw new Error('Invalid payment status');
    }

    const before = await getPaymentSummaries({
      invoiceIds: [payment.invoice_id],
      invoiceType: payment.invoice_type,
      transaction,
    });
    const currentSummary = before.get(String(payment.invoice_id)) ?? { claimedAmount: 0, verifiedAmount: 0 };
    const previousAmountCountsTowardBalance = BALANCE_PAYMENT_STATUSES.includes(previousStatus);
    const otherClaimedAmount = currentSummary.claimedAmount - (previousAmountCountsTowardBalance ? previousAmount : 0);
    if (BALANCE_PAYMENT_STATUSES.includes(nextStatus) && toCents(otherClaimedAmount + nextAmount) > toCents(invoice.total)) {
      throw new Error('Paid amount cannot exceed the remaining invoice balance');
    }

    const becomesVerified = !wasVerified && VERIFIED_PAYMENT_STATUSES.includes(nextStatus);
    await payment.update({
      paid_amount: nextAmount,
      payment_status: nextStatus,
      ...(payload.payment_method !== undefined ? { payment_method: payload.payment_method } : {}),
      ...(file ? { picture: file.filename } : {}),
      ...(becomesVerified ? { verified_by: verifiedBy, verifiedAt: new Date() } : {}),
    }, { transaction });

    if (becomesVerified) await recordVerifiedPayment(payment, nextAmount, transaction);

    const balanceState = await refreshInvoicePaymentState({
      invoiceId: payment.invoice_id,
      invoiceType: payment.invoice_type,
      transaction,
    });
    await payment.update({ balance_amount: balanceState.balance }, { transaction });

    await transaction.commit();

    if (file && previousPicture) {
      const oldPath = path.resolve('uploads', 'payment_proof_images', previousPicture);
      fs.unlink(oldPath, () => { /* ignore errors */ });
    }

    const result = await getPaymentById(id);
    if (previousStatus !== nextStatus) {
      await notifyCustomerOfPaymentStatus(result, nextStatus);
    }
    return result;
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

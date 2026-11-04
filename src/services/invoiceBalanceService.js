'use strict';

const { Op } = require('sequelize');
const db = require('../../models');
const {
  BALANCE_PAYMENT_STATUSES,
  VERIFIED_PAYMENT_STATUSES,
  calculateInvoiceBalance,
  isInvoiceFullyPaid,
} = require('../utils/invoicePaymentBalance');

const getInvoiceModel = (invoiceType) =>
  invoiceType === 'Towing Service' ? db.TowingInvoice : db.Invoice;

const getPaymentSummaries = async ({ invoiceIds, invoiceType = 'Service', transaction } = {}) => {
  const ids = (Array.isArray(invoiceIds) ? invoiceIds : [invoiceIds])
    .filter((id) => id !== undefined && id !== null);
  if (!ids.length) return new Map();

  const groupedPayments = await db.InvoicePayment.findAll({
    attributes: [
      'invoice_id',
      'payment_status',
      [db.Sequelize.fn('SUM', db.Sequelize.col('paid_amount')), 'paid_amount'],
    ],
    where: {
      invoice_id: { [Op.in]: ids },
      invoice_type: invoiceType,
      is_deleted: 0,
      payment_status: { [Op.in]: BALANCE_PAYMENT_STATUSES },
    },
    group: ['invoice_id', 'payment_status'],
    raw: true,
    ...(transaction ? { transaction } : {}),
  });

  const summaries = new Map();
  for (const row of groupedPayments) {
    const key = String(row.invoice_id);
    const summary = summaries.get(key) ?? { claimedAmount: 0, verifiedAmount: 0 };
    const amount = Number(row.paid_amount ?? 0);
    summary.claimedAmount += amount;
    if (VERIFIED_PAYMENT_STATUSES.includes(row.payment_status)) summary.verifiedAmount += amount;
    summaries.set(key, summary);
  }

  return summaries;
};

const refreshInvoicePaymentState = async ({ invoiceId, invoiceType = 'Service', transaction } = {}) => {
  const InvoiceModel = getInvoiceModel(invoiceType);
  const invoice = await InvoiceModel.findOne({
    where: { id: invoiceId, is_deleted: 0 },
    transaction,
    lock: transaction?.LOCK?.UPDATE,
  });
  if (!invoice) throw new Error('Invoice not found');

  const summaries = await getPaymentSummaries({ invoiceIds: [invoiceId], invoiceType, transaction });
  const summary = summaries.get(String(invoiceId)) ?? { claimedAmount: 0, verifiedAmount: 0 };
  const total = Number(invoice.total ?? 0);
  const balance = calculateInvoiceBalance(total, summary.claimedAmount);

  await invoice.update({
    payment_status: isInvoiceFullyPaid(total, summary.verifiedAmount) ? 'completed' : 'pending',
  }, { transaction });

  return { total, balance, ...summary };
};

module.exports = {
  getInvoiceModel,
  getPaymentSummaries,
  refreshInvoicePaymentState,
};

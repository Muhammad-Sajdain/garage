// src/services/invoiceService.js
const db = require('../../models');
const { Invoice, InvoiceDetail, InvoicePayment, TaskCard, Quotation, Vehicle, Customer, Sequelize } = db;

const invoiceIncludes = [
  { model: InvoiceDetail, as: 'details', where: { is_deleted: 0 }, required: false },
  {
    model: TaskCard,
    as: 'taskCard',
    include: [{
      model: Quotation,
      as: 'quotation',
      include: [{
        model: Vehicle,
        as: 'vehicle',
        include: [{ model: Customer, as: 'customer' }],
      }],
    }],
  },
];

const normalizeInvoiceFilters = ({ task_id, customer_id, vehicle_id, page, limit, search, dateField, startDate, endDate, ...filters } = {}) => ({
  ...filters,
  ...(task_id !== undefined ? { task_card_id: task_id } : {}),
  ...(customer_id !== undefined ? { '$taskCard.quotation.vehicle.customer_id$': Number(customer_id) } : {}),
  ...(vehicle_id !== undefined ? { '$taskCard.quotation.vehicle_id$': Number(vehicle_id) } : {}),
});

// Helper to fetch invoice with details
const getInvoiceById = async (id) => {
  return Invoice.findOne({
    where: { id, is_deleted: 0 },
    include: invoiceIncludes,
  });
};

// List invoices (optional filters)
const listInvoices = async (filters = {}) => {
  const where = { is_deleted: 0, ...normalizeInvoiceFilters(filters) };
  const invoices = await Invoice.findAll({ where, include: invoiceIncludes, order: [['id', 'ASC']] });
  if (!invoices.length) return [];

  const invoiceIds = invoices.map(invoice => invoice.id);
  const paymentTotals = await InvoicePayment.findAll({
    attributes: [
      'invoice_id',
      [Sequelize.fn('SUM', Sequelize.col('paid_amount')), 'paid_amount'],
    ],
    where: { invoice_id: invoiceIds, is_deleted: 0, payment_status: 'verified' },
    group: ['invoice_id'],
    raw: true,
  });
  const paidByInvoiceId = new Map(paymentTotals.map(payment => [String(payment.invoice_id), Number(payment.paid_amount ?? 0)]));

  return invoices.map(invoice => {
    const data = invoice.toJSON();
    const paidAmount = paidByInvoiceId.get(String(invoice.id)) ?? 0;
    return {
      ...data,
      paid_amount: paidAmount,
      balance_amount: Math.max(0, Number(data.total ?? 0) - paidAmount),
    };
  });
};

// Create invoice with nested details
const createInvoice = async (payload) => {
  const { company_id, task_card_id, task_id, invoice_number, invoice_status = 'draft', payment_status = 'pending', subtotal, discount, discount_percentage, tax_amount, tax_percentage, total, creation_date, created_by, updated_by = null, is_deleted = 0, details = [] } = payload;
  const taskCardId = task_id ?? task_card_id;

  const invoice = await Invoice.create({
    company_id,
    task_card_id: taskCardId,
    invoice_number,
    invoice_status,
    payment_status,
    subtotal,
    discount,
    discount_percentage,
    tax_amount,
    tax_percentage,
    total,
    creation_date,
    created_by,
    updated_by,
    is_deleted,
    status: 1
  });

  if (Array.isArray(details) && details.length) {
    const rows = details.map(d => ({
      invoice_id: invoice.id,
      type: d.type,
      description: d.description,
      qty: d.qty,
      unit_price: d.unit_price,
      discount: d.discount,
      tax: d.tax,
      status: d.status !== undefined ? d.status : 1,
      created_by: d.created_by || created_by,
      updated_by: d.updated_by || null,
      is_deleted: d.is_deleted !== undefined ? d.is_deleted : 0
    }));
    await InvoiceDetail.bulkCreate(rows);
  }

  return getInvoiceById(invoice.id);
};

// Update invoice (company_id and task_card_id immutable)
const updateInvoice = async (id, payload) => {
  const invoice = await Invoice.findOne({ where: { id, is_deleted: 0 } });
  if (!invoice) throw new Error('Invoice not found');

  const hasDetails = Object.prototype.hasOwnProperty.call(payload, 'details');
  const { company_id, task_card_id, task_id, details, ...updatable } = payload;
  await invoice.update(updatable);

  // Sync details
  if (hasDetails && Array.isArray(details)) {
    const existing = await InvoiceDetail.findAll({ where: { invoice_id: id, is_deleted: 0 } });
    const existingById = new Map(existing.map(detail => [String(detail.id), detail.id]));
    const existingIds = existing.map(detail => detail.id);
    const payloadIds = new Set(details.filter(detail => detail.id !== undefined && detail.id !== null).map(detail => String(detail.id)));
    // Soft‑delete missing
    const toDelete = existingIds.filter(existingId => !payloadIds.has(String(existingId)));
    if (toDelete.length) await InvoiceDetail.update({ is_deleted: 1 }, { where: { id: toDelete, invoice_id: id } });
    // Upsert each detail
    for (const d of details) {
      const { id: detailId, ...rest } = d;
      const matchedId = detailId != null ? existingById.get(String(detailId)) : undefined;
      if (matchedId !== undefined) {
        await InvoiceDetail.update(rest, { where: { id: matchedId, invoice_id: id } });
      } else {
        await InvoiceDetail.create({
          ...rest,
          invoice_id: id,
          created_by: rest.created_by ?? payload.created_by ?? invoice.created_by,
        });
      }
    }
  }

  return getInvoiceById(id);
};

// Soft‑delete invoice and cascade
const deleteInvoice = async (id) => {
  const invoice = await Invoice.findOne({ where: { id, is_deleted: 0 } });
  if (!invoice) throw new Error('Invoice not found');
  await invoice.update({ is_deleted: 1 });
  await InvoiceDetail.update({ is_deleted: 1 }, { where: { invoice_id: id } });
  return { success: true, message: 'Invoice deleted' };
};

module.exports = { listInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice };

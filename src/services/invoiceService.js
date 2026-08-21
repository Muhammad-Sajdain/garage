// src/services/invoiceService.js
const db = require('../../models');
const { Invoice, InvoiceDetail, TaskCard, Quotation, Vehicle, Customer } = db;

const invoiceIncludes = [
  { model: InvoiceDetail, as: 'details' },
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

const normalizeInvoiceFilters = ({ task_id, ...filters } = {}) => (
  task_id === undefined ? filters : { ...filters, task_card_id: task_id }
);

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
  return Invoice.findAll({ where, include: invoiceIncludes, order: [['id', 'ASC']] });
};

// Create invoice with nested details
const createInvoice = async (payload) => {
  const { company_id, task_card_id, task_id, invoice_number, invoice_status = 'draft', payment_status = 'pending', subtotal, discount, tax_amount, tax_percentage, total, creation_date, created_by, updated_by = null, is_deleted = 0, details = [] } = payload;
  const taskCardId = task_id ?? task_card_id;

  const invoice = await Invoice.create({
    company_id,
    task_card_id: taskCardId,
    invoice_number,
    invoice_status,
    payment_status,
    subtotal,
    discount,
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

  const { company_id, task_card_id, task_id, details = [], ...updatable } = payload;
  await invoice.update(updatable);

  // Sync details
  if (Array.isArray(details)) {
    const existing = await InvoiceDetail.findAll({ where: { invoice_id: id, is_deleted: 0 } });
    const existingIds = existing.map(d => d.id);
    const payloadIds = details.filter(d => d.id).map(d => d.id);
    // Soft‑delete missing
    const toDelete = existingIds.filter(eid => !payloadIds.includes(eid));
    if (toDelete.length) await InvoiceDetail.update({ is_deleted: 1 }, { where: { id: toDelete } });
    // Upsert each detail
    for (const d of details) {
      const { id: detailId, ...rest } = d;
      if (detailId) {
        await InvoiceDetail.update(rest, { where: { id: detailId } });
      } else {
        await InvoiceDetail.create({ ...rest, invoice_id: id });
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

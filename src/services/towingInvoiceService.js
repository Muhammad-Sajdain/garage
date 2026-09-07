const db = require('../../models');

const { TowingInvoice, Company, Vehicle, Customer, InvoicePayment } = db;

const towingInvoiceIncludes = [
  { model: Company, as: 'company' },
  { model: Vehicle, as: 'vehicle', include: [{ model: Customer, as: 'customer' }] },
];

const writableFields = [
  'company_id', 'vehicle_id', 'invoice_number', 'invoice_status', 'payment_status',
  'pick_up_address', 'drop_off_address', 'mileage', 'rate', 'miles', 'amount',
  'subtotal', 'discount', 'discount_percentage', 'tax_amount', 'tax_percentage',
  'total', 'creation_date', 'created_by', 'updated_by', 'status', 'is_deleted',
];

const getWritablePayload = (payload = {}) => Object.fromEntries(
  writableFields
    .filter((field) => payload[field] !== undefined)
    .map((field) => [field, payload[field]]),
);

const withPaymentBalances = async (invoices) => {
  const records = Array.isArray(invoices) ? invoices : invoices ? [invoices] : [];
  if (!records.length) return Array.isArray(invoices) ? [] : null;

  const payments = await InvoicePayment.findAll({
    attributes: ['invoice_id', 'balance_amount'],
    where: {
      invoice_id: records.map((invoice) => invoice.id),
      invoice_type: 'Towing Service',
      is_deleted: 0,
    },
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    raw: true,
  });
  const balanceByInvoiceId = new Map();
  for (const payment of payments) {
    const invoiceId = String(payment.invoice_id);
    if (!balanceByInvoiceId.has(invoiceId)) {
      balanceByInvoiceId.set(invoiceId, Number(payment.balance_amount ?? 0));
    }
  }

  const enhanced = records.map((invoice) => {
    const data = invoice.toJSON();
    const total = Number(data.total ?? 0);
    const balanceAmount = balanceByInvoiceId.get(String(data.id)) ?? total;
    return {
      ...data,
      amountPaid: Math.max(0, total - balanceAmount),
      balance_amount: balanceAmount,
    };
  });
  return Array.isArray(invoices) ? enhanced : enhanced[0];
};

const getTowingInvoiceById = async (id) => withPaymentBalances(await TowingInvoice.findOne({
  where: { id, is_deleted: 0 },
  include: towingInvoiceIncludes,
}));

const listTowingInvoices = async ({ company_id, vehicle_id, invoice_status, payment_status, status } = {}) => {
  const where = { is_deleted: 0 };
  if (company_id !== undefined) where.company_id = company_id;
  if (vehicle_id !== undefined) where.vehicle_id = vehicle_id;
  if (invoice_status !== undefined) where.invoice_status = invoice_status;
  if (payment_status !== undefined) where.payment_status = payment_status;
  if (status !== undefined) where.status = status;

  return withPaymentBalances(await TowingInvoice.findAll({ where, include: towingInvoiceIncludes, order: [['id', 'DESC']] }));
};

const createTowingInvoice = async (payload) => {
  const invoice = await TowingInvoice.create(getWritablePayload(payload));
  return getTowingInvoiceById(invoice.id);
};

const updateTowingInvoice = async (id, payload) => {
  const invoice = await TowingInvoice.findOne({ where: { id, is_deleted: 0 } });
  if (!invoice) throw new Error('Towing invoice not found');

  await invoice.update(getWritablePayload(payload));
  return getTowingInvoiceById(id);
};

const deleteTowingInvoice = async (id) => {
  const invoice = await TowingInvoice.findOne({ where: { id, is_deleted: 0 } });
  if (!invoice) throw new Error('Towing invoice not found');

  await invoice.update({ is_deleted: 1 });
  return { success: true, message: 'Towing invoice deleted successfully' };
};

module.exports = {
  listTowingInvoices,
  getTowingInvoiceById,
  createTowingInvoice,
  updateTowingInvoice,
  deleteTowingInvoice,
};

const db = require('../../models');

const { TowingInvoice, Company, Vehicle, Customer } = db;
const { getPaymentSummaries } = require('./invoiceBalanceService');
const { calculateInvoiceBalance, isInvoiceFullyPaid } = require('../utils/invoicePaymentBalance');

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

  const paymentSummaries = await getPaymentSummaries({
    invoiceIds: records.map((invoice) => invoice.id),
    invoiceType: 'Towing Service',
  });

  const enhanced = records.map((invoice) => {
    const data = invoice.toJSON();
    const total = Number(data.total ?? 0);
    const summary = paymentSummaries.get(String(data.id)) ?? { claimedAmount: 0, verifiedAmount: 0 };
    const balanceAmount = calculateInvoiceBalance(total, summary.claimedAmount);
    return {
      ...data,
      amountPaid: summary.verifiedAmount,
      pending_payment_amount: Math.max(0, summary.claimedAmount - summary.verifiedAmount),
      balance_amount: balanceAmount,
      payment_status: isInvoiceFullyPaid(total, summary.verifiedAmount) ? 'completed' : 'pending',
    };
  });
  return Array.isArray(invoices) ? enhanced : enhanced[0];
};

const getTowingInvoiceById = async (id) => withPaymentBalances(await TowingInvoice.findOne({
  where: { id, is_deleted: 0 },
  include: towingInvoiceIncludes,
}));

const listTowingInvoices = async ({ company_id, vehicle_id, customer_id, invoice_status, payment_status, status } = {}) => {
  const where = { is_deleted: 0 };
  if (company_id !== undefined) where.company_id = company_id;
  if (vehicle_id !== undefined) where.vehicle_id = vehicle_id;
  if (customer_id !== undefined) where['$vehicle.customer_id$'] = Number(customer_id);
  if (invoice_status !== undefined) where.invoice_status = invoice_status;
  if (payment_status !== undefined) where.payment_status = payment_status;
  if (status !== undefined) where.status = status;

  return withPaymentBalances(await TowingInvoice.findAll({ where, include: towingInvoiceIncludes, order: [['id', 'DESC']] }));
};

const createTowingInvoice = async (payload) => {
  const pickUpAddress = String(payload.pick_up_address ?? '').trim();
  const dropOffAddress = String(payload.drop_off_address ?? '').trim();
  const rate = Number(payload.rate);
  if (!pickUpAddress) throw new Error('Pickup address is required');
  if (!dropOffAddress) throw new Error('Drop off address is required');
  if (!Number.isFinite(rate) || rate <= 0) throw new Error('Rate/Mile must be greater than 0');

  const invoice = await TowingInvoice.create({
    ...getWritablePayload(payload),
    invoice_status: payload.invoice_status ?? 'approved',
    payment_status: payload.payment_status ?? 'pending',
    pick_up_address: pickUpAddress,
    drop_off_address: dropOffAddress,
  });
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

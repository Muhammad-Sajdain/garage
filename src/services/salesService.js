const db = require('../../models');

const saleIncludes = [
  { model: db.Invoice, as: 'invoice' },
  { model: db.TowingInvoice, as: 'towingInvoice' },
];

const withInvoiceNumber = (sale) => {
  const record = sale.toJSON ? sale.toJSON() : sale;
  const sourceInvoice = record.invoice_type === 'Towing Service' ? record.towingInvoice : record.invoice;
  return {
    ...record,
    invoice_number: sourceInvoice?.invoice_number ?? null,
  };
};

const listSales = async ({ company_id } = {}) => {
  const where = { is_deleted: 0 };
  if (company_id !== undefined) where.company_id = company_id;

  const sales = await db.Sales.findAll({
    where,
    include: saleIncludes,
    order: [['createdAt', 'DESC']],
  });
  return sales.map(withInvoiceNumber);
};

module.exports = { listSales };

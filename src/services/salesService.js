const db = require('../../models');

const listSales = async ({ company_id } = {}) => {
  const where = { is_deleted: 0 };
  if (company_id !== undefined) where.company_id = company_id;

  return db.Sales.findAll({
    where,
    include: [{ model: db.Invoice, as: 'invoice' }],
    order: [['createdAt', 'DESC']],
  });
};

module.exports = { listSales };

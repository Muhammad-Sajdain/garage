const db = require('../../models');

const getCompanyExpenseById = (id) => db.CompanyExpense.findByPk(id, {
  include: [{ model: db.Company, as: 'company' }, { model: db.Users, as: 'creator' }],
});

const listCompanyExpenses = ({ company_id } = {}) => db.CompanyExpense.findAll({
  where: company_id !== undefined ? { company_id } : {},
  include: [{ model: db.Company, as: 'company' }, { model: db.Users, as: 'creator' }],
  order: [['id', 'DESC']],
});

const validateTransactionType = (transactionType) => {
  if (transactionType !== undefined && !['Debit', 'Credit'].includes(transactionType)) {
    throw new Error('transaction_type must be Debit or Credit');
  }
};

const createCompanyExpense = async (payload) => {
  validateTransactionType(payload.transaction_type);
  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('amount must be greater than zero');
  }

  const transaction = await db.sequelize.transaction();
  try {
    let account = await db.CompanyAccount.findOne({
      where: { company_id: payload.company_id, status: 1, is_deleted: 0 },
      order: [['id', 'ASC']],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!account) {
      account = await db.CompanyAccount.create({
        company_id: payload.company_id,
        current_amount: 0,
        status: 1,
        is_deleted: 0,
      }, { transaction });
    }

    const currentAmount = Number(account.current_amount) || 0;
    const balance = Number((payload.transaction_type === 'Debit'
      ? currentAmount - amount
      : currentAmount + amount).toFixed(2));

    const expense = await db.CompanyExpense.create({
      company_id: payload.company_id,
      transaction_type: payload.transaction_type,
      reason: payload.reason,
      amount,
      balance,
      created_by: payload.created_by,
    }, { transaction });
    await account.update({ current_amount: balance }, { transaction });

    await transaction.commit();
    return getCompanyExpenseById(expense.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateCompanyExpense = async (id, payload) => {
  const expense = await db.CompanyExpense.findByPk(id);
  if (!expense) throw new Error('Company expense not found');
  validateTransactionType(payload.transaction_type);

  const updateData = {};
  ['company_id', 'transaction_type', 'reason', 'amount', 'balance', 'created_by'].forEach((field) => {
    if (payload[field] !== undefined) updateData[field] = payload[field];
  });
  await expense.update(updateData);
  return getCompanyExpenseById(id);
};

const deleteCompanyExpense = async (id) => {
  const expense = await db.CompanyExpense.findByPk(id);
  if (!expense) throw new Error('Company expense not found');
  await expense.destroy();
  return { success: true, message: 'Company expense deleted successfully' };
};

module.exports = { listCompanyExpenses, getCompanyExpenseById, createCompanyExpense, updateCompanyExpense, deleteCompanyExpense };

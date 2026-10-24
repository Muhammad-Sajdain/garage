const db = require('../../models');

const PackageHistory = db.PackageHistory;
const PackageSale = db.PackageSale;

const syncCompletedPackageSale = async (packageHistory, transaction) => {
  if (String(packageHistory.payment_status).trim().toLowerCase() !== 'completed') return;

  const saleData = {
    package_history_id: packageHistory.id,
    company_id: packageHistory.company_id,
    amount: packageHistory.amount,
    status: 1,
    is_deleted: 0,
  };
  const existingSale = await PackageSale.findOne({
    where: { package_history_id: packageHistory.id, is_deleted: 0 },
    transaction,
  });

  if (existingSale) {
    await existingSale.update(saleData, { transaction });
  } else {
    await PackageSale.create(saleData, { transaction });
  }
};

const listPackageHistories = async (companyId) => {
  const normalizedCompanyId = companyId == null || companyId === '' ? null : Number(companyId);
  if (normalizedCompanyId !== null && (!Number.isInteger(normalizedCompanyId) || normalizedCompanyId <= 0)) {
    throw new Error('company_id must be a positive number');
  }

  return PackageHistory.findAll({
    where: {
      is_deleted: 0,
      ...(normalizedCompanyId !== null ? { company_id: normalizedCompanyId } : {}),
    },
    include: [{
      model: db.Package,
      as: 'package',
      attributes: ['id', 'name'],
    }, {
      model: db.Company,
      as: 'company',
      attributes: ['id', 'name'],
    }],
    order: [['id', 'ASC']],
  });
};

const getPackageHistoryById = async (id) => {
  return PackageHistory.findOne({
    where: { id, is_deleted: 0 },
  });
};

const createPackageHistory = async (payload) => {
  const {
    package_id,
    company_id,
    start_date,
    end_date,
    payment_status = 'Pending',
    package_type = 'Monthly',
    amount = 0.00,
    status = 1,
  } = payload;

  return db.sequelize.transaction(async (transaction) => {
    const packageHistory = await PackageHistory.create({
      package_id,
      company_id,
      start_date,
      end_date,
      payment_status,
      package_type,
      amount,
      status,
      is_deleted: 0,
    }, { transaction });

    await syncCompletedPackageSale(packageHistory, transaction);
    return packageHistory;
  });
};

const updatePackageHistory = async (id, payload) => {
  const packageHistory = await PackageHistory.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!packageHistory) {
    throw new Error('PackageHistory not found');
  }

  return db.sequelize.transaction(async (transaction) => {
    await packageHistory.update(payload, { transaction });
    await syncCompletedPackageSale(packageHistory, transaction);
    return packageHistory;
  });
};

const deletePackageHistory = async (id) => {
  const packageHistory = await PackageHistory.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!packageHistory) {
    throw new Error('PackageHistory not found');
  }

  await packageHistory.update({ is_deleted: 1 });
  return { success: true, message: 'PackageHistory deleted successfully' };
};

module.exports = {
  listPackageHistories,
  getPackageHistoryById,
  createPackageHistory,
  updatePackageHistory,
  deletePackageHistory,
};

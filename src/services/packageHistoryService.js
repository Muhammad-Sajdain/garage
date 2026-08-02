const db = require('../../models');

const PackageHistory = db.PackageHistory;

const listPackageHistories = async () => {
  return PackageHistory.findAll({
    where: { is_deleted: 0 },
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
    status = 1,
  } = payload;

  return PackageHistory.create({
    package_id,
    company_id,
    start_date,
    end_date,
    status,
    is_deleted: 0,
  });
};

const updatePackageHistory = async (id, payload) => {
  const packageHistory = await PackageHistory.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!packageHistory) {
    throw new Error('PackageHistory not found');
  }

  await packageHistory.update(payload);
  return getPackageHistoryById(id);
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

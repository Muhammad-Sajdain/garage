'use strict';

const db = require('../../models');
const { PackageSale } = db;

const listPackageSales = async () => PackageSale.findAll({
  where: { is_deleted: 0 },
  include: [{
    model: db.Company,
    as: 'company',
    attributes: ['id', 'name'],
  }, {
    model: db.PackageHistory,
    as: 'packageHistory',
    attributes: ['id', 'package_id', 'package_type'],
    include: [{
      model: db.Package,
      as: 'package',
      attributes: ['id', 'name'],
    }],
  }],
  order: [['id', 'DESC']],
});

module.exports = { listPackageSales };

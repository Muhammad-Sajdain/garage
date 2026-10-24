'use strict';

module.exports = (sequelize, DataTypes) => {
  const PackageSale = sequelize.define('PackageSale', {
    package_history_id: { type: DataTypes.INTEGER, allowNull: false },
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
  }, {
    tableName: 'package_sales',
    timestamps: true,
  });

  PackageSale.associate = (models) => {
    PackageSale.belongsTo(models.Company, {
      foreignKey: 'company_id',
      as: 'company',
    });
    PackageSale.belongsTo(models.PackageHistory, {
      foreignKey: 'package_history_id',
      as: 'packageHistory',
    });
  };

  return PackageSale;
};

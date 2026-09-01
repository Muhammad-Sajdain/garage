'use strict';

module.exports = (sequelize, DataTypes) => {
  const CompanyAccount = sequelize.define('CompanyAccount', {
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    current_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
  }, { tableName: 'company_accounts', timestamps: true });

  CompanyAccount.associate = (models) => {
    CompanyAccount.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
  };

  return CompanyAccount;
};

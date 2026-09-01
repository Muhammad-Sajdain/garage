'use strict';

module.exports = (sequelize, DataTypes) => {
  const CompanyExpense = sequelize.define('CompanyExpense', {
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    transaction_type: { type: DataTypes.ENUM('Debit', 'Credit'), allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    balance: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
  }, { tableName: 'company_expenses', timestamps: true });

  CompanyExpense.associate = (models) => {
    CompanyExpense.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    CompanyExpense.belongsTo(models.Users, { foreignKey: 'created_by', as: 'creator' });
  };

  return CompanyExpense;
};

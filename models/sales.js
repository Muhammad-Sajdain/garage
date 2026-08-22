'use strict';

module.exports = (sequelize, DataTypes) => {
  const Sales = sequelize.define('Sales', {
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    invoice_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
  }, {
    tableName: 'sales',
    timestamps: true,
  });

  Sales.associate = (models) => {
    Sales.belongsTo(models.Invoice, { foreignKey: 'invoice_id', as: 'invoice' });
  };

  return Sales;
};

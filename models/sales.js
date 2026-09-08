'use strict';

module.exports = (sequelize, DataTypes) => {
  const Sales = sequelize.define('Sales', {
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    invoice_id: { type: DataTypes.INTEGER, allowNull: false },
    invoice_type: { type: DataTypes.ENUM('Service', 'Towing Service'), allowNull: false, defaultValue: 'Service' },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
  }, {
    tableName: 'sales',
    timestamps: true,
  });

  Sales.associate = (models) => {
    Sales.belongsTo(models.Invoice, { foreignKey: 'invoice_id', as: 'invoice' });
    // `invoice_id` points to either a service or towing invoice based on `invoice_type`.
    Sales.belongsTo(models.TowingInvoice, { foreignKey: 'invoice_id', as: 'towingInvoice', constraints: false });
  };

  return Sales;
};

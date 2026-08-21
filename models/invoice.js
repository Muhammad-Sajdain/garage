// models/invoice.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    task_card_id: { type: DataTypes.INTEGER, allowNull: false },
    invoice_number: { type: DataTypes.STRING, allowNull: true },
    invoice_status: { type: DataTypes.ENUM('draft','pending','approved'), allowNull: false, defaultValue: 'draft' },
    payment_status: { type: DataTypes.ENUM('pending','completed'), allowNull: false, defaultValue: 'pending' },
    subtotal: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    discount: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    tax_amount: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    tax_percentage: { type: DataTypes.DECIMAL(5,2), allowNull: true },
    total: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    creation_date: { type: DataTypes.DATEONLY, allowNull: false },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 }
  }, {
    tableName: 'invoices',
    timestamps: true
  });

  Invoice.associate = models => {
    Invoice.belongsTo(models.TaskCard, { foreignKey: 'task_card_id', as: 'taskCard' });
    Invoice.hasMany(models.InvoiceDetail, { foreignKey: 'invoice_id', as: 'details' });
  };

  return Invoice;
};

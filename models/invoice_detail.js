// models/invoice_detail.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const InvoiceDetail = sequelize.define('InvoiceDetail', {
    invoice_id: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM('service','parts'), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    qty: { type: DataTypes.INTEGER, allowNull: false },
    unit_price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    discount: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    tax: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'invoice_details',
    timestamps: true
  });

  InvoiceDetail.associate = models => {
    InvoiceDetail.belongsTo(models.Invoice, { foreignKey: 'invoice_id', as: 'invoice' });
  };

  return InvoiceDetail;
};

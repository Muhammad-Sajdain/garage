// models/invoice_payment.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const InvoicePayment = sequelize.define('InvoicePayment', {
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    invoice_id: { type: DataTypes.INTEGER, allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    balance_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    paid_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    picture: { type: DataTypes.STRING, allowNull: true },
    payment_method: { type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'online'), allowNull: false },
    payment_status: { type: DataTypes.ENUM('pending', 'not_verified', 'verified', 'rejected'), allowNull: false },
    payment_done_by: { type: DataTypes.ENUM('company', 'customer'), allowNull: false },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    verified_by: { type: DataTypes.INTEGER, allowNull: true },
    verifiedAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'invoice_payments',
    timestamps: true
  });

  InvoicePayment.associate = models => {
    InvoicePayment.belongsTo(models.Invoice, { foreignKey: 'invoice_id', as: 'invoice' });
    // Optional association to Company if model exists
    if (models.Company) {
      InvoicePayment.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    }
  };

  return InvoicePayment;
};

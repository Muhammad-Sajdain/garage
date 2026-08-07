// models/quotation.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Quotation = sequelize.define('Quotation', {
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    quotation_number: { type: DataTypes.STRING, allowNull: false },
    vehicle_id: { type: DataTypes.INTEGER, allowNull: false },
    mileage: { type: DataTypes.INTEGER, allowNull: false },
    note: { type: DataTypes.TEXT, allowNull: true },
    quotation_status: { type: DataTypes.ENUM('draft','pending','approved','rejected','cancelled'), allowNull: false, defaultValue: 'draft' },
    subtotal: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    discount: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    tax_amount: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    tax_percentage: { type: DataTypes.DECIMAL(5,2), allowNull: true },
    total: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    creation_date: { type: DataTypes.DATEONLY, allowNull: false },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
  }, {
    tableName: 'quotations',
    timestamps: true,
  });

  Quotation.associate = models => {
    Quotation.hasMany(models.QuotationDetail, { foreignKey: 'quotation_id', as: 'details' });
    Quotation.hasMany(models.QuotationDocument, { foreignKey: 'quotation_id', as: 'documents' });
  };

  return Quotation;
};

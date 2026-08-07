// models/quotationdetail.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const QuotationDetail = sequelize.define('QuotationDetail', {
    quotation_id: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM('service','parts'), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    qty: { type: DataTypes.INTEGER, allowNull: false },
    unit_price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    discount: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    tax: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
  }, {
    tableName: 'quotation_details',
    timestamps: true,
  });

  QuotationDetail.associate = models => {
    QuotationDetail.belongsTo(models.Quotation, { foreignKey: 'quotation_id', as: 'quotation' });
  };

  return QuotationDetail;
};

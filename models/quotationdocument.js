// models/quotationdocument.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const QuotationDocument = sequelize.define('QuotationDocument', {
    quotation_id: { type: DataTypes.INTEGER, allowNull: false },
    document: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
  }, {
    tableName: 'quotation_documents',
    timestamps: true,
  });

  QuotationDocument.associate = models => {
    QuotationDocument.belongsTo(models.Quotation, { foreignKey: 'quotation_id', as: 'quotation' });
  };

  return QuotationDocument;
};

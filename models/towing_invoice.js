'use strict';

module.exports = (sequelize, DataTypes) => {
  const TowingInvoice = sequelize.define('TowingInvoice', {
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    vehicle_id: { type: DataTypes.INTEGER, allowNull: true },
    invoice_number: { type: DataTypes.STRING, allowNull: true },
    invoice_status: { type: DataTypes.ENUM('draft', 'pending', 'approved'), allowNull: false, defaultValue: 'draft' },
    payment_status: { type: DataTypes.ENUM('pending', 'completed'), allowNull: false, defaultValue: 'pending' },
    pick_up_address: { type: DataTypes.STRING, allowNull: true },
    drop_off_address: { type: DataTypes.STRING, allowNull: true },
    mileage: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    rate: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    miles: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    discount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    discount_percentage: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    tax_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    tax_percentage: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    creation_date: { type: DataTypes.DATEONLY, allowNull: false },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
  }, {
    tableName: 'towing_invoice',
    timestamps: true,
  });

  TowingInvoice.associate = (models) => {
    TowingInvoice.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    TowingInvoice.belongsTo(models.Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });
  };

  return TowingInvoice;
};

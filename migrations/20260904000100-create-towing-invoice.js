'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('towing_invoice', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      invoice_number: { type: Sequelize.STRING, allowNull: true },
      invoice_status: { type: Sequelize.ENUM('draft', 'pending', 'approved'), allowNull: false, defaultValue: 'draft' },
      payment_status: { type: Sequelize.ENUM('pending', 'completed'), allowNull: false, defaultValue: 'pending' },
      pick_up_address: { type: Sequelize.STRING, allowNull: true },
      drop_off_address: { type: Sequelize.STRING, allowNull: true },
      mileage: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      rate: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      miles: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      discount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      discount_percentage: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      tax_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      tax_percentage: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      creation_date: { type: Sequelize.DATEONLY, allowNull: false },
      created_by: { type: Sequelize.INTEGER, allowNull: false },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
      status: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 1 },
      is_deleted: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('towing_invoice');
  },
};

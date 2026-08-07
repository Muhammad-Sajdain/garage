'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invoices', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      task_card_id: { type: Sequelize.INTEGER, allowNull: false },
      invoice_status: { type: Sequelize.ENUM('draft','pending','approved'), allowNull: false, defaultValue: 'draft' },
      payment_status: { type: Sequelize.ENUM('pending','completed'), allowNull: false, defaultValue: 'pending' },
      subtotal: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      discount: { type: Sequelize.DECIMAL(10,2), allowNull: true },
      tax_amount: { type: Sequelize.DECIMAL(10,2), allowNull: true },
      tax_percentage: { type: Sequelize.DECIMAL(5,2), allowNull: true },
      total: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      creation_date: { type: Sequelize.DATEONLY, allowNull: false },
      created_by: { type: Sequelize.INTEGER, allowNull: false },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
      status: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 1 },
      is_deleted: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('invoices');
  }
};

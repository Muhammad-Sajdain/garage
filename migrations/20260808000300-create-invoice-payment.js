'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invoice_payments', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      invoice_id: { type: Sequelize.INTEGER, allowNull: false },
      total_amount: { type: Sequelize.DECIMAL(12,2), allowNull: false },
      balance_amount: { type: Sequelize.DECIMAL(12,2), allowNull: false },
      paid_amount: { type: Sequelize.DECIMAL(12,2), allowNull: false },
      picture: { type: Sequelize.STRING, allowNull: true },
      payment_method: { type: Sequelize.ENUM('cash','card','bank_transfer','online'), allowNull: false },
      payment_status: { type: Sequelize.ENUM('pending','not_verified','verified','rejected'), allowNull: false },
      payment_done_by: { type: Sequelize.ENUM('company','customer'), allowNull: false },
      is_deleted: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
      created_by: { type: Sequelize.INTEGER, allowNull: false },
      verified_by: { type: Sequelize.INTEGER, allowNull: true },
      verifiedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('invoice_payments');
  }
};

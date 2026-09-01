'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('company_expenses', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      transaction_type: { type: Sequelize.ENUM('Debit', 'Credit'), allowNull: false },
      reason: { type: Sequelize.TEXT, allowNull: false },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      balance: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      created_by: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('company_expenses');
  },
};

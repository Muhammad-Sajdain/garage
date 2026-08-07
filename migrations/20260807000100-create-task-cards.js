'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('task_cards', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      quotation_id: { type: Sequelize.INTEGER, allowNull: false },
      status: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 1 },
      is_deleted: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
      created_by: { type: Sequelize.INTEGER, allowNull: false },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('task_cards');
  }
};

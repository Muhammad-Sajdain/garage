'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tasks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      task_card_id: { type: Sequelize.INTEGER, allowNull: false },
      type: { type: Sequelize.ENUM('service', 'parts'), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      qty: { type: Sequelize.INTEGER, allowNull: false },
      task_status: { type: Sequelize.ENUM('pending', 'Inprogress', 'compeleted', 'cancelled'), allowNull: false, defaultValue: 'pending' },
      status: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 1 },
      is_deleted: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
      created_by: { type: Sequelize.INTEGER, allowNull: false },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tasks');
  }
};

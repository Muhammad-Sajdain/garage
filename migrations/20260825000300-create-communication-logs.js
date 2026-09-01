'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('communication_logs', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      channel: { type: Sequelize.ENUM('Email', 'WhatsApp', 'SMS'), allowNull: false },
      user_id: { type: Sequelize.INTEGER, allowNull: false },
      status: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 1 },
      is_deleted: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('communication_logs');
  },
};

'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sendgrid_settings', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      sendgrid_api_key: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 1 },
      is_deleted: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
      created_by: { type: Sequelize.INTEGER, allowNull: false },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sendgrid_settings');
  }
};

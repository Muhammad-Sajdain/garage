'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vehicle_maintenance_pictures', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      task_card_id: { type: Sequelize.STRING, allowNull: false },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      picture: { type: Sequelize.STRING, allowNull: false },
      picture_tag: { type: Sequelize.ENUM('before','after'), allowNull: false },
      status: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 1 },
      is_deleted: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
      created_by: { type: Sequelize.INTEGER, allowNull: false },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vehicle_maintenance_pictures');
  }
};

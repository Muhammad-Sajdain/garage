'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('modules', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { allowNull: false, type: Sequelize.TEXT },
      status: { allowNull: false, type: Sequelize.TINYINT, defaultValue: 1 },
      is_deleted: { allowNull: false, type: Sequelize.TINYINT, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });

    await queryInterface.createTable('sub_modules', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      module_id: { allowNull: false, type: Sequelize.INTEGER },
      name: { allowNull: false, type: Sequelize.TEXT },
      status: { allowNull: false, type: Sequelize.TINYINT, defaultValue: 1 },
      is_deleted: { allowNull: false, type: Sequelize.TINYINT, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });

    await queryInterface.createTable('role_permission', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      role_id: { allowNull: false, type: Sequelize.INTEGER },
      permission: { allowNull: false, type: Sequelize.JSON },
      status: { allowNull: false, type: Sequelize.TINYINT, defaultValue: 1 },
      is_deleted: { allowNull: false, type: Sequelize.TINYINT, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('role_permission');
    await queryInterface.dropTable('sub_modules');
    await queryInterface.dropTable('modules');
  },
};

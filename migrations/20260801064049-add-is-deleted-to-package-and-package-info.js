'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('packages', 'is_deleted', {
      type: Sequelize.TINYINT,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('package_infos', 'is_deleted', {
      type: Sequelize.TINYINT,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('packages', 'is_deleted');
    await queryInterface.removeColumn('package_infos', 'is_deleted');
  },
};

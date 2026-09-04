'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    for (const tableName of ['packages', 'package_infos']) {
      const table = await queryInterface.describeTable(tableName).catch(() => null);

      if (table && !table.is_deleted) {
        await queryInterface.addColumn(tableName, 'is_deleted', {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 0,
        });
      }
    }
  },

  async down(queryInterface, Sequelize) {
    for (const tableName of ['packages', 'package_infos']) {
      const table = await queryInterface.describeTable(tableName).catch(() => null);

      if (table && table.is_deleted) {
        await queryInterface.removeColumn(tableName, 'is_deleted');
      }
    }
  },
};

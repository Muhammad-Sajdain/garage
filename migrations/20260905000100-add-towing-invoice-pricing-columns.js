
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'towing_invoice';

    const existingColumns = await queryInterface.describeTable(tableName);

    const columnsToAdd = {
      mileage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      miles: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
    };

    for (const [columnName, definition] of Object.entries(columnsToAdd)) {
      if (!existingColumns[columnName]) {
        await queryInterface.addColumn(
          tableName,
          columnName,
          definition
        );
      }
    }
  },

  async down(queryInterface) {
    const tableName = 'towing_invoice';
    const existingColumns = await queryInterface.describeTable(tableName);

    for (const columnName of ['amount', 'miles', 'rate', 'mileage']) {
      if (existingColumns[columnName]) {
        await queryInterface.removeColumn(tableName, columnName);
      }
    }
  },
};
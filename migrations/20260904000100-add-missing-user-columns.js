'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('users');
    const columns = {
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },
      is_deleted: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
    };

    for (const [columnName, definition] of Object.entries(columns)) {
      if (!table[columnName]) {
        await queryInterface.addColumn('users', columnName, definition);
      }
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('users');
    const columns = ['country', 'password', 'phone', 'address', 'status', 'is_deleted'];

    for (const columnName of columns) {
      if (table[columnName]) {
        await queryInterface.removeColumn('users', columnName);
      }
    }
  },
};

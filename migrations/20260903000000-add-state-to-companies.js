"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add 'state' column to companies table, defaulting to empty string for existing rows
    await queryInterface.addColumn('companies', 'state', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('companies', 'state');
  },
};

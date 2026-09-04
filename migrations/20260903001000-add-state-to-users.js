"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'state', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'state');
  },
};

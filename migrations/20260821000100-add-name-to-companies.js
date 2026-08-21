'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('companies', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Unnamed Company',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('companies', 'name');
  },
};

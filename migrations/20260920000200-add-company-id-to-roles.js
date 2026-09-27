'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('roles', 'company_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addIndex('roles', ['company_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('roles', ['company_id']);
    await queryInterface.removeColumn('roles', 'company_id');
  },
};

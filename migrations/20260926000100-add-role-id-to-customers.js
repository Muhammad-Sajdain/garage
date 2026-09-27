'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'role_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addIndex('customers', ['role_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('customers', ['role_id']);
    await queryInterface.removeColumn('customers', 'role_id');
  },
};

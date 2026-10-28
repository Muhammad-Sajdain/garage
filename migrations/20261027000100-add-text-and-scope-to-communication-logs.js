'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('communication_logs', 'text', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('communication_logs', 'scope', {
      type: Sequelize.ENUM('system', 'customer'),
      allowNull: false,
      defaultValue: 'system',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('communication_logs', 'scope');
    await queryInterface.removeColumn('communication_logs', 'text');
  },
};

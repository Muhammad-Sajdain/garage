'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('notifications', 'scope', {
      type: Sequelize.ENUM('system', 'customer'),
      allowNull: false,
      defaultValue: 'system',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('notifications', 'scope');
  },
};

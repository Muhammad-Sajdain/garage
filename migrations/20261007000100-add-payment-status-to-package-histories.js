'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('package_histories', 'payment_status', {
      type: Sequelize.ENUM('Completed', 'Pending'),
      allowNull: false,
      defaultValue: 'Pending',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('package_histories', 'payment_status');
  },
};

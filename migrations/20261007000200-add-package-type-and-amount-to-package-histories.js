'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('package_histories', 'package_type', {
      type: Sequelize.ENUM('Yearly', 'Monthly'),
      allowNull: false,
      defaultValue: 'Monthly',
    });

    await queryInterface.addColumn('package_histories', 'amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('package_histories', 'amount');
    await queryInterface.removeColumn('package_histories', 'package_type');
  },
};

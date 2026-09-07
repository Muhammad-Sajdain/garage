'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('towing_invoice', 'mileage', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('towing_invoice', 'rate', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('towing_invoice', 'miles', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('towing_invoice', 'amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('towing_invoice', 'amount');
    await queryInterface.removeColumn('towing_invoice', 'miles');
    await queryInterface.removeColumn('towing_invoice', 'rate');
    await queryInterface.removeColumn('towing_invoice', 'mileage');
  },
};

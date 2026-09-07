'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('invoice_payments', 'service_type', {
      type: Sequelize.ENUM('Service', 'Towing Service'),
      allowNull: false,
      defaultValue: 'Service',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('invoice_payments', 'service_type');
  },
};

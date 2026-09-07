'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('invoice_payments', 'service_type', 'invoice_type');
    await queryInterface.addColumn('sales', 'invoice_type', {
      type: Sequelize.ENUM('Service', 'Towing Service'),
      allowNull: false,
      defaultValue: 'Service',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('sales', 'invoice_type');
    await queryInterface.renameColumn('invoice_payments', 'invoice_type', 'service_type');
  },
};

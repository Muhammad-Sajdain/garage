'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('invoice_payments', 'towing_invoice_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('invoice_payments', 'towing_invoice_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};

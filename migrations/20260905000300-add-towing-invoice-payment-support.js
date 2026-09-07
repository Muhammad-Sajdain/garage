'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('invoice_payments', 'invoice_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('invoice_payments', 'towing_invoice_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('invoice_payments', 'towing_invoice_id');
    await queryInterface.changeColumn('invoice_payments', 'invoice_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};

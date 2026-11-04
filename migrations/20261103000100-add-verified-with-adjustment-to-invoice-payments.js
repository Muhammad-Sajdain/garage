'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('invoice_payments', 'payment_status', {
      type: Sequelize.ENUM('pending', 'not_verified', 'verified', 'verified_with_adjustment', 'rejected'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "UPDATE invoice_payments SET payment_status = 'verified' WHERE payment_status = 'verified_with_adjustment'",
    );
    await queryInterface.changeColumn('invoice_payments', 'payment_status', {
      type: Sequelize.ENUM('pending', 'not_verified', 'verified', 'rejected'),
      allowNull: false,
    });
  },
};

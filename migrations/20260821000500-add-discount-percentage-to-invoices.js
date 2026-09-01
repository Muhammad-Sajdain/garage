'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('invoices', 'discount_percentage', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('invoices', 'discount_percentage');
  },
};

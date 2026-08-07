'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quotation_details', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      quotation_id: { type: Sequelize.INTEGER, allowNull: false },
      type: { type: Sequelize.ENUM('service','parts'), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      qty: { type: Sequelize.INTEGER, allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      discount: { type: Sequelize.DECIMAL(10,2), allowNull: true },
      tax: { type: Sequelize.DECIMAL(10,2), allowNull: true },
      status: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 1 },
      is_deleted: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.addIndex('quotation_details', ['quotation_id']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('quotation_details');
  }
};

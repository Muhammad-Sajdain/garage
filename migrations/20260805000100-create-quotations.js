'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quotations', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      quotation_number: { type: Sequelize.STRING, allowNull: false },
      vehicle_id: { type: Sequelize.INTEGER, allowNull: false },
      mileage: { type: Sequelize.INTEGER, allowNull: false },
      note: { type: Sequelize.TEXT, allowNull: true },
      quotation_status: { type: Sequelize.ENUM('draft','pending','approved','rejected','cancelled'), allowNull: false, defaultValue: 'draft' },
      subtotal: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      discount: { type: Sequelize.DECIMAL(10,2), allowNull: true },
      tax_amount: { type: Sequelize.DECIMAL(10,2), allowNull: true },
      tax_percentage: { type: Sequelize.DECIMAL(5,2), allowNull: true },
      total: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      creation_date: { type: Sequelize.DATEONLY, allowNull: false },
      created_by: { type: Sequelize.INTEGER, allowNull: false },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
      status: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 1 },
      is_deleted: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('quotations');
  }
};

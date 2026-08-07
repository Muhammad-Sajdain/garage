'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer_reviews', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      task_card_id: { type: Sequelize.INTEGER, allowNull: false },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      rating: { type: Sequelize.INTEGER, allowNull: false },
      review: { type: Sequelize.TEXT, allowNull: true },
      status: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 1 },
      is_deleted: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
      created_by: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customer_reviews');
  }
};

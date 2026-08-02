'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('insured_vehicles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      vehicle_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'vehicles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      insurance_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      policy_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expiry_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      claim_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      insurance_company: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      insurance_company_phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },
      is_deleted: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('insured_vehicles', ['vehicle_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('insured_vehicles');
  },
};
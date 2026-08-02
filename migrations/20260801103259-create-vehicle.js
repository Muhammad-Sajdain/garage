'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vehicles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      make: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      model: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      variant: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      VIN: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      license_plate: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      insured: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
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

    await queryInterface.addIndex('vehicles', ['customer_id']);
    await queryInterface.addIndex('vehicles', ['VIN']);
    await queryInterface.addIndex('vehicles', ['license_plate']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vehicles');
  },
};
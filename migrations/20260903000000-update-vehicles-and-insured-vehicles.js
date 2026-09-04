'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // vehicles: make `name` and `license_plate` nullable
    await queryInterface.changeColumn('vehicles', 'name', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.changeColumn('vehicles', 'license_plate', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    // insured_vehicles: adjust nullability per request
    await queryInterface.changeColumn('insured_vehicles', 'insurance_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('insured_vehicles', 'policy_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('insured_vehicles', 'expiry_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // claim_number should be NOT NULL
    await queryInterface.changeColumn('insured_vehicles', 'claim_number', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('insured_vehicles', 'insurance_company', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('insured_vehicles', 'insurance_company_phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // revert vehicles
    await queryInterface.changeColumn('vehicles', 'name', {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn('vehicles', 'license_plate', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    // revert insured_vehicles to previous constraints
    await queryInterface.changeColumn('insured_vehicles', 'insurance_number', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('insured_vehicles', 'policy_number', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('insured_vehicles', 'expiry_date', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.changeColumn('insured_vehicles', 'claim_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('insured_vehicles', 'insurance_company', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('insured_vehicles', 'insurance_company_phone', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};

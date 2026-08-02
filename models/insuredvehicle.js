'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InsuredVehicle extends Model {
    static associate(models) {
      InsuredVehicle.belongsTo(models.Vehicle, {
        foreignKey: 'vehicle_id',
        as: 'vehicle',
      });
    }
  }

  InsuredVehicle.init(
    {
      vehicle_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      insurance_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      policy_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiry_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      claim_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      insurance_company: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      insurance_company_phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },
      is_deleted: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'InsuredVehicle',
      tableName: 'insured_vehicles',
    }
  );

  return InsuredVehicle;
};
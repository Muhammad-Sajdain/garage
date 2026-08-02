'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Model {
    static associate(models) {
      Vehicle.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer',
      });

      Vehicle.hasOne(models.InsuredVehicle, {
        foreignKey: 'vehicle_id',
        as: 'insuredVehicle',
      });
    }
  }

  Vehicle.init(
    {
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      make: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      model: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      variant: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      VIN: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      license_plate: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      insured: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      modelName: 'Vehicle',
      tableName: 'vehicles',
    }
  );

  return Vehicle;
};
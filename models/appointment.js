'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');
  class Appointment extends Model {
    static associate(models) {
      // Association with Company
      Appointment.belongsTo(models.Company, {
        foreignKey: 'company_id',
        as: 'company',
      });
    }
  }
  Appointment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customer_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customer_phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      VIN: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      license_plate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reservation_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending','confirmed','completed','cancelled','no_show'),
        allowNull: false,
        defaultValue: 'pending',
      },
      is_deleted: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Appointment',
      tableName: 'appointments',
    }
  );
  return Appointment;
};

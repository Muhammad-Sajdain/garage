'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PackageHistory extends Model {
    static associate(models) {
      PackageHistory.belongsTo(models.Package, {
        foreignKey: 'package_id',
        as: 'package',
      });

      PackageHistory.belongsTo(models.Company, {
        foreignKey: 'company_id',
        as: 'company',
      });
    }
  }

  PackageHistory.init(
    {
      package_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.ENUM('Completed', 'Pending'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      package_type: {
        type: DataTypes.ENUM('Yearly', 'Monthly'),
        allowNull: false,
        defaultValue: 'Monthly',
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
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
      modelName: 'PackageHistory',
      tableName: 'package_histories',
    }
  );

  return PackageHistory;
};

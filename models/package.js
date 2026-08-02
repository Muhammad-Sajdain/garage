'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Package extends Model {
    static associate(models) {
      Package.hasMany(models.PackageInfo, {
        foreignKey: 'package_id',
        as: 'packageInfos',
      });
    }
  }

  Package.init(
    {
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      monthly: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      yearly: {
        type: DataTypes.DECIMAL(10, 2),
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
      modelName: 'Package',
      tableName: 'packages',
    }
  );

  return Package;
};

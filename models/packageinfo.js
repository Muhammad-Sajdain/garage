'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PackageInfo extends Model {
    static associate(models) {
      PackageInfo.belongsTo(models.Package, {
        foreignKey: 'package_id',
        as: 'package',
      });
    }
  }

  PackageInfo.init(
    {
      package_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      information: {
        type: DataTypes.TEXT,
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
      modelName: 'PackageInfo',
      tableName: 'package_infos',
    }
  );

  return PackageInfo;
};

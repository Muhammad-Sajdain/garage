'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CompanyUser extends Model {
    static associate(models) {
      CompanyUser.belongsTo(models.Users, {
        foreignKey: 'user_id',
        as: 'user',
      });

      CompanyUser.belongsTo(models.Company, {
        foreignKey: 'company_id',
        as: 'company',
      });

      CompanyUser.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role',
      });
    }
  }

  CompanyUser.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.INTEGER,
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
      modelName: 'CompanyUser',
      tableName: 'company_users',
    }
  );

  return CompanyUser;
};
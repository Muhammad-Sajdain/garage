'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Role.init({
    company_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    status: DataTypes.TINYINT,
    is_deleted: DataTypes.TINYINT
  }, {
    sequelize,
    modelName: 'Role',
  });
  Role.associate = models => {
    Role.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    Role.hasMany(models.RolePermission, { foreignKey: 'role_id', as: 'permissions' });
  };
  return Role;
};

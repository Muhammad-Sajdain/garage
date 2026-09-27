'use strict';

module.exports = (sequelize, DataTypes) => {
  const Module = sequelize.define('Module', {
    name: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'modules',
    timestamps: false,
  });

  Module.associate = (models) => {
    Module.hasMany(models.SubModule, { foreignKey: 'module_id', as: 'subModules' });
  };

  return Module;
};

'use strict';

module.exports = (sequelize, DataTypes) => {
  const SubModule = sequelize.define('SubModule', {
    module_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'sub_modules',
    timestamps: false,
  });

  SubModule.associate = (models) => {
    SubModule.belongsTo(models.Module, { foreignKey: 'module_id', as: 'module' });
  };

  return SubModule;
};

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    read: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
  }, { tableName: 'notifications', timestamps: true });

  Notification.associate = (models) => {
    Notification.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    Notification.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
  };

  return Notification;
};

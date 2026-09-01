'use strict';

module.exports = (sequelize, DataTypes) => {
  const CommunicationLog = sequelize.define('CommunicationLog', {
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    channel: { type: DataTypes.ENUM('Email', 'WhatsApp', 'SMS'), allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  }, { tableName: 'communication_logs', timestamps: false });

  CommunicationLog.associate = (models) => {
    CommunicationLog.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    CommunicationLog.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
  };

  return CommunicationLog;
};

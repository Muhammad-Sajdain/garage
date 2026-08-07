// models/sendgrid_setting.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const SendgridSetting = sequelize.define('SendgridSetting', {
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    sendgrid_api_key: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'sendgrid_settings',
    timestamps: true
  });
  return SendgridSetting;
};

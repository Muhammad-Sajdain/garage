// models/twilio_sms_setting.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const TwilioSmsSetting = sequelize.define('TwilioSmsSetting', {
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    sms_account_sid: { type: DataTypes.STRING(255), allowNull: false },
    sms_auth_token: { type: DataTypes.TEXT, allowNull: false },
    sms_from_number: { type: DataTypes.STRING(30), allowNull: false },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'twilio_sms_settings',
    timestamps: true
  });

  TwilioSmsSetting.associate = models => {
    TwilioSmsSetting.belongsTo(models.Company, {
      foreignKey: 'company_id',
      as: 'company',
    });
  };

  return TwilioSmsSetting;
};

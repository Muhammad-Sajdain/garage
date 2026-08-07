// models/twilio_whatsapp_setting.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const TwilioWhatsappSetting = sequelize.define('TwilioWhatsappSetting', {
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    whatsapp_account_sid: { type: DataTypes.STRING(255), allowNull: false },
    whatsapp_auth_token: { type: DataTypes.TEXT, allowNull: false },
    whatsapp_from_number: { type: DataTypes.STRING(50), allowNull: false },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'twilio_whatsapp_settings',
    timestamps: true
  });
  return TwilioWhatsappSetting;
};

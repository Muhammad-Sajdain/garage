'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('twilio_whatsapp_settings', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      whatsapp_account_sid: { type: Sequelize.STRING(255), allowNull: false },
      whatsapp_auth_token: { type: Sequelize.TEXT, allowNull: false },
      whatsapp_from_number: { type: Sequelize.STRING(50), allowNull: false },
      status: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 1 },
      is_deleted: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
      created_by: { type: Sequelize.INTEGER, allowNull: false },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('twilio_whatsapp_settings');
  }
};

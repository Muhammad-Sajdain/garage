// src/services/twilioWhatsappSettingService.js
const db = require('../../models');
const { TwilioWhatsappSetting } = db;

class TwilioWhatsappSettingService {
  // Create a new setting
  async createSetting(data) {
    const setting = await TwilioWhatsappSetting.create(data);
    return setting;
  }

  // Find by primary key (non‑deleted only)
  async getSettingById(id) {
    return await TwilioWhatsappSetting.findOne({ where: { id, is_deleted: 0 } });
  }

  // List with optional filters (company_id, status)
  async listSettings(query) {
    const where = { is_deleted: 0 };
    if (query.company_id) where.company_id = query.company_id;
    if (query.status) where.status = query.status;
    return await TwilioWhatsappSetting.findAll({ where });
  }

  // Update a setting
  async updateSetting(id, data) {
    const setting = await this.getSettingById(id);
    if (!setting) throw new Error('Setting not found');
    await setting.update(data);
    return setting;
  }

  // Soft delete
  async deleteSetting(id) {
    const setting = await this.getSettingById(id);
    if (!setting) throw new Error('Setting not found');
    await setting.update({ is_deleted: 1 });
    return { message: 'Setting soft‑deleted' };
  }
}

module.exports = new TwilioWhatsappSettingService();

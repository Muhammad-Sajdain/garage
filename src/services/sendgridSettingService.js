// src/services/sendgridSettingService.js
const db = require('../../models');
const { SendgridSetting } = db;

class SendgridSettingService {
  // Create a new SendGrid setting
  async createSetting(data) {
    const setting = await SendgridSetting.create(data);
    return setting;
  }

  // Retrieve a setting by primary key (exclude soft‑deleted)
  async getSettingById(id) {
    return await SendgridSetting.findOne({ where: { id, is_deleted: 0 } });
  }

  // List settings with optional filters (company_id, status)
  async listSettings(query) {
    const where = { is_deleted: 0 };
    if (query.company_id) where.company_id = query.company_id;
    if (query.status) where.status = query.status;
    return await SendgridSetting.findAll({ where });
  }

  // Update an existing setting
  async updateSetting(id, data) {
    const setting = await this.getSettingById(id);
    if (!setting) throw new Error('Setting not found');
    await setting.update(data);
    return setting;
  }

  // Soft delete a setting
  async deleteSetting(id) {
    const setting = await this.getSettingById(id);
    if (!setting) throw new Error('Setting not found');
    await setting.update({ is_deleted: 1 });
    return { message: 'Setting soft‑deleted' };
  }
}

module.exports = new SendgridSettingService();

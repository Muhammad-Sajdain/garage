// src/services/sendgridSettingService.js
const db = require('../../models');
const { SendgridSetting, Company } = db;
const createHttpError = (message, status) => Object.assign(new Error(message), { status });

class SendgridSettingService {
  async ensureNoOtherActiveSetting(companyId, currentId = null) {
    const where = { company_id: companyId, status: 1, is_deleted: 0 };
    if (currentId !== null) where.id = { [db.Sequelize.Op.ne]: currentId };

    const existing = await SendgridSetting.findOne({ where });
    if (existing) {
      throw createHttpError('This company already has an active email setting.', 409);
    }
  }

  // Create an email setting; only one active setting is allowed per company.
  async createSetting(data) {
    if (Number(data.status ?? 1) === 1) {
      await this.ensureNoOtherActiveSetting(data.company_id);
    }
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
    return await SendgridSetting.findAll({
      where,
      include: [{ model: Company, as: 'company', attributes: ['id', 'name'] }],
    });
  }

  // Update an existing setting
  async updateSetting(id, data) {
    const setting = await this.getSettingById(id);
    if (!setting) throw new Error('Setting not found');

    const companyId = data.company_id ?? setting.company_id;
    const status = Number(data.status ?? setting.status);
    if (status === 1) {
      await this.ensureNoOtherActiveSetting(companyId, setting.id);
    }
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

// src/services/twilioWhatsappSendService.js
const db = require('../../models');
const { TwilioWhatsappSetting, Customer } = db;
const twilio = require('twilio');

class TwilioWhatsappSendService {
  /**
   * Send a WhatsApp message using the company's Twilio WhatsApp credentials.
   * @param {Object} params - { message, company_id, customer_id }
   * @returns {Promise<Object>} Twilio message resource.
   */
  async sendMessage({ message, company_id, customer_id }) {
    if (!message || !company_id || !customer_id) {
      throw new Error('Missing required fields: message, company_id, customer_id');
    }

    // Get WhatsApp credentials for the company
    const setting = await TwilioWhatsappSetting.findOne({
      where: { company_id, is_deleted: 0, status: 1 },
    });
    if (!setting) {
      throw new Error('Twilio WhatsApp settings not found for the specified company');
    }

    // Get customer's phone number
    const customer = await Customer.findOne({
      where: { id: customer_id, is_deleted: 0 },
    });
    if (!customer) {
      throw new Error('Customer not found');
    }
    if (!customer.phone) {
      throw new Error('Customer does not have a phone number');
    }

    const client = twilio(setting.whatsapp_account_sid, setting.whatsapp_auth_token);

    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${setting.whatsapp_from_number}`,
      to: `whatsapp:${customer.phone}`,
    });
    return result;
  }
}

module.exports = new TwilioWhatsappSendService();

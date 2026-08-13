// src/services/twilioSmsSendService.js
const db = require('../../models');
const { TwilioSmsSetting, Customer } = db;
const twilio = require('twilio');

class TwilioSmsSendService {
  /**
   * Send an SMS message using company Twilio credentials to a customer's phone number.
   * @param {Object} params
   * @param {number} params.companyId - ID of the company whose Twilio settings to use.
   * @param {number} params.customerId - ID of the customer to receive the SMS.
   * @param {string} params.message - Text message to send.
   * @returns {Promise<Object>} Twilio message resource.
   */
  async sendMessage({ companyId, customerId, message }) {
    // Validate inputs
    if (!companyId || !customerId || !message) {
      throw new Error('Missing required fields: companyId, customerId, or message');
    }

    // Fetch Twilio settings for the company
    const setting = await TwilioSmsSetting.findOne({
      where: { company_id: companyId, is_deleted: 0 },
    });
    if (!setting) {
      throw new Error('Twilio SMS setting not found for the specified company');
    }

    // Fetch customer to get phone number
    const customer = await Customer.findOne({
      where: { id: customerId, is_deleted: 0 },
    });
    if (!customer) {
      throw new Error('Customer not found');
    }
    if (!customer.phone) {
      throw new Error('Customer does not have a phone number');
    }

    // Initialise Twilio client
    const client = twilio(setting.sms_account_sid, setting.sms_auth_token);

    // Send the SMS
    const result = await client.messages.create({
      body: message,
      from: setting.sms_from_number,
      to: customer.phone,
    });
    return result;
  }
}

module.exports = new TwilioSmsSendService();

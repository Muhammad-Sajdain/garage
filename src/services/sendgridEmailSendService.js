// src/services/sendgridEmailSendService.js
const path = require('path');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');
const db = require('../../models');

const { SendgridSetting, Customer, Company } = db;

class SendgridEmailSendService {
  /**
   * Helper to format attachments into SendGrid expected structure.
   */
  formatAttachments(attachmentInput, reqFile) {
    const attachments = [];

    // Check multer uploaded file
    if (reqFile) {
      let contentBase64;
      if (reqFile.buffer) {
        contentBase64 = reqFile.buffer.toString('base64');
      } else if (reqFile.path && fs.existsSync(reqFile.path)) {
        contentBase64 = fs.readFileSync(reqFile.path).toString('base64');
      }
      if (contentBase64) {
        attachments.push({
          content: contentBase64,
          filename: reqFile.originalname || 'attachment',
          type: reqFile.mimetype || 'application/octet-stream',
          disposition: 'attachment',
        });
      }
    }

    // Check attachment in body
    if (attachmentInput) {
      if (Array.isArray(attachmentInput)) {
        attachmentInput.forEach((att) => {
          if (att && att.content) {
            attachments.push({
              content: att.content,
              filename: att.filename || 'attachment',
              type: att.type || 'application/octet-stream',
              disposition: 'attachment',
            });
          }
        });
      } else if (typeof attachmentInput === 'object' && attachmentInput.content) {
        attachments.push({
          content: attachmentInput.content,
          filename: attachmentInput.filename || 'attachment',
          type: attachmentInput.type || 'application/octet-stream',
          disposition: 'attachment',
        });
      } else if (typeof attachmentInput === 'string') {
        if (fs.existsSync(attachmentInput)) {
          const fileBuffer = fs.readFileSync(attachmentInput);
          attachments.push({
            content: fileBuffer.toString('base64'),
            filename: path.basename(attachmentInput),
            type: 'application/octet-stream',
            disposition: 'attachment',
          });
        } else {
          attachments.push({
            content: attachmentInput,
            filename: 'attachment',
            type: 'application/octet-stream',
            disposition: 'attachment',
          });
        }
      }
    }

    return attachments.length > 0 ? attachments : undefined;
  }

  /**
   * Send an email using company SendGrid credentials to a customer's email.
   * @param {Object} params
   * @param {number} params.companyId - ID of the company whose SendGrid settings to use.
   * @param {number} params.customerId - ID of the customer to receive the email.
   * @param {string} params.message - Text/HTML body message.
   * @param {string} [params.subject] - Email subject.
   * @param {string} [params.fromEmail] - Optional sender email.
   * @param {Object|Array|string} [params.attachment] - Attachment content or object.
   * @param {Object} [params.reqFile] - Express multer file object if uploaded via form-data.
   * @returns {Promise<Object>} SendGrid email dispatch result.
   */
  async sendEmail({ companyId, customerId, message, subject, fromEmail, attachment, reqFile }) {
    if (!companyId || !customerId || !message) {
      throw new Error('Missing required fields: company_id, customer_id, or message');
    }

    // 1. Fetch SendGrid settings for company
    const setting = await SendgridSetting.findOne({
      where: { company_id: companyId, is_deleted: 0 },
    });

    if (!setting || !setting.sendgrid_api_key) {
      throw new Error('SendGrid settings or API key not found for the specified company');
    }

    // 2. Fetch customer email
    const customer = await Customer.findOne({
      where: { id: customerId, is_deleted: 0 },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }
    if (!customer.email) {
      throw new Error('Customer does not have an email address');
    }

    // 3. Determine sender email
    let senderEmail = fromEmail || setting.email || setting.from_email || setting.sender_email;
    if (!senderEmail) {
      const company = await Company.findOne({
        where: { id: companyId, is_deleted: 0 },
      });
      if (company && company.email) {
        senderEmail = company.email;
      }
    }

    if (!senderEmail) {
      senderEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@garage.com';
    }

    // 4. Configure SendGrid API key
    sgMail.setApiKey(setting.sendgrid_api_key);

    // 5. Format attachments if present
    const formattedAttachments = this.formatAttachments(attachment, reqFile);

    // 6. Build message payload
    const msg = {
      to: customer.email,
      from: senderEmail,
      subject: subject || 'Notification from Garage',
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
    };

    if (formattedAttachments) {
      msg.attachments = formattedAttachments;
    }

    // 7. Send email
    const response = await sgMail.send(msg);

    return {
      success: true,
      message: 'Email sent successfully',
      to: customer.email,
      from: senderEmail,
      statusCode: response[0] ? response[0].statusCode : 202,
    };
  }
}

module.exports = new SendgridEmailSendService();

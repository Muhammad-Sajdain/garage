const db = require('../../models');

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

const sendAccountCreatedEmail = async ({ customer, company_id }) => {
  const apiKey = process.env.GARAGE_WORKOS_RESEND_API_KEY;
  const senderEmail = process.env.GARAGE_WORKOS_EMAIL;
  if (!apiKey || !senderEmail) {
    throw new Error('GARAGE_WORKOS_EMAIL and GARAGE_WORKOS_RESEND_API_KEY must be configured');
  }
  if (!customer?.email) throw new Error('Customer does not have an email address');

  const company = await db.Company.findOne({
    where: { id: company_id, is_deleted: 0 },
    attributes: ['name'],
  });
  const companyName = company?.name || 'Garage';
  const customerName = customer.name || 'Customer';
  const loginUrl = 'http://localhost:3000/login-customer';
  const password = 'garageCustomer@123';
  const text = `Dear ${customerName},\n\nYour account has been created. Please use these credentials to log in to your account.\nLink: ${loginUrl}\nPassword: ${password}\n\nThank you for choosing our services. We appreciate your trust in us and look forward to serving you.\n\nBest regards,\n${companyName}`;
  const html = `<p>Dear ${escapeHtml(customerName)},</p>
    <p>Your account has been created. Please use these credentials to log in to your account.</p>
    <p>Link: <a href="${loginUrl}">${loginUrl}</a><br>Password: ${escapeHtml(password)}</p>
    <p>Thank you for choosing our services. We appreciate your trust in us and look forward to serving you.</p>
    <p>Best regards,<br>${escapeHtml(companyName)}</p>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: senderEmail,
      to: customer.email,
      subject: 'Account has been created',
      text,
      html,
    }),
  });

  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(`Resend rejected customer welcome email (${response.status}): ${details.message || 'unknown error'}`);
  }

  return response.json().catch(() => ({}));
};

const sendPasswordResetEmail = async ({ customer }) => {
  const apiKey = process.env.GARAGE_WORKOS_RESEND_API_KEY;
  const senderEmail = process.env.GARAGE_WORKOS_EMAIL;
  if (!apiKey || !senderEmail) {
    throw new Error('GARAGE_WORKOS_EMAIL and GARAGE_WORKOS_RESEND_API_KEY must be configured');
  }
  if (!customer?.email) throw new Error('Customer does not have an email address');

  const company = await db.Company.findOne({
    where: { id: customer.company_id, is_deleted: 0 },
    attributes: ['name'],
  });
  const companyName = company?.name || 'Garage';
  const customerName = customer.name || 'Customer';
  const loginUrl = 'http://localhost:3000/login-customer';
  const password = 'garageCustomer@123';
  const text = `Dear Customer ${customerName},\n\nPassword of your account has been reset. Please use these credentials to log in to your account.\n\nLink: ${loginUrl}\nPassword: ${password}\n\nBest regards,\n${companyName}`;
  const html = `<p>Dear Customer ${escapeHtml(customerName)},</p>
    <p>Password of your account has been reset. Please use these credentials to log in to your account.</p>
    <p>Link: <a href="${loginUrl}">${loginUrl}</a><br>Password: ${escapeHtml(password)}</p>
    <p>Best regards,<br>${escapeHtml(companyName)}</p>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: senderEmail, to: customer.email, subject: 'Password Reset', text, html }),
  });

  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(`Resend rejected customer password reset email (${response.status}): ${details.message || 'unknown error'}`);
  }
  return response.json().catch(() => ({}));
};

module.exports = { sendAccountCreatedEmail, sendPasswordResetEmail };

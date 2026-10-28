const communicationLogService = require('./communicationLogService');

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

const sendAccountCreatedEmail = async ({ user, companyId }) => {
  const apiKey = process.env.GARAGE_WORKOS_RESEND_API_KEY;
  const senderEmail = process.env.GARAGE_WORKOS_EMAIL;
  const loginUrl = process.env.GARAGE_WORKOS_USER_LOGIN_LINK;
  if (!apiKey || !senderEmail) {
    throw new Error('GARAGE_WORKOS_EMAIL and GARAGE_WORKOS_RESEND_API_KEY must be configured');
  }
  if (!loginUrl) throw new Error('GARAGE_WORKOS_USER_LOGIN_LINK must be configured');
  if (!user?.email) throw new Error('User does not have an email address');

  const name = user.name || 'User';
  const password = 'garage@123';
  const text = `Dear ${name},\n\nYour account has been created. Please use these credentials to log in to your account.\n\nLink: ${loginUrl}\nPassword: ${password}\n\nBest regards,\nGarageWorkOs`;
  const html = `<p>Dear ${escapeHtml(name)},</p>
    <p>Your account has been created. Please use these credentials to log in to your account.</p>
    <p>Link: <a href="${loginUrl}">${loginUrl}</a><br>Password: ${escapeHtml(password)}</p>
    <p>Best regards,<br>GarageWorkOs</p>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: senderEmail, to: user.email, subject: 'Account has been created', text, html }),
  });

  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(`Resend rejected account email (${response.status}): ${details.message || 'unknown error'}`);
  }
  await logSystemEmail({ user, companyId, subject: 'Account has been created' });
  return response.json().catch(() => ({}));
};

const sendPasswordResetEmail = async ({ user, companyId }) => {
  const apiKey = process.env.GARAGE_WORKOS_RESEND_API_KEY;
  const senderEmail = process.env.GARAGE_WORKOS_EMAIL;
  const loginUrl = process.env.GARAGE_WORKOS_USER_LOGIN_LINK;
  if (!apiKey || !senderEmail) {
    throw new Error('GARAGE_WORKOS_EMAIL and GARAGE_WORKOS_RESEND_API_KEY must be configured');
  }
  if (!loginUrl) throw new Error('GARAGE_WORKOS_USER_LOGIN_LINK must be configured');
  if (!user?.email) throw new Error('User does not have an email address');

  const name = user.name || 'User';
  const password = 'garage@123';
  const text = `Dear ${name},\n\nPassword of your account has been reset.\n\nLink: ${loginUrl}\nPassword: ${password}\n\nBest regards,\nGarageWorkOs`;
  const html = `<p>Dear ${escapeHtml(name)},</p>
    <p>Password of your account has been reset.</p>
    <p>Link: <a href="${loginUrl}">${loginUrl}</a><br>Password: ${escapeHtml(password)}</p>
    <p>Best regards,<br>GarageWorkOs</p>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: senderEmail, to: user.email, subject: 'Password Reset', text, html }),
  });

  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(`Resend rejected password reset email (${response.status}): ${details.message || 'unknown error'}`);
  }
  await logSystemEmail({ user, companyId, subject: 'Password Reset' });
  return response.json().catch(() => ({}));
};

const logSystemEmail = async ({ user, companyId = null, subject }) => {
  try {
    await communicationLogService.createCommunicationLog({
      company_id: companyId,
      channel: 'Email',
      user_id: user.id,
      text: subject,
      scope: 'system',
      status: 1,
    });
  } catch (error) {
    console.error('Email sent, but system communication log could not be created:', error.message);
  }
};

module.exports = { sendAccountCreatedEmail, sendPasswordResetEmail };

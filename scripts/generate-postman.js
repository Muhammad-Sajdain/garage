const fs = require('fs');
const path = require('path');

const base_url = '{{base_url}}';

const authHeader = (token) => [{ key: 'Authorization', value: `Bearer {{${token}}}` }];
const jsonHeader = (token) => [
  { key: 'Content-Type', value: 'application/json' },
  { key: 'Authorization', value: `Bearer {{${token}}}` }
];

const loginTest = (tokenKey) => [{
  listen: 'test',
  script: {
    exec: [
      'if (pm.response.code === 200) {',
      '    const json = pm.response.json();',
      '    if (json.token) {',
      `        pm.collectionVariables.set('${tokenKey}', json.token);`,
      '    }',
      '}'
    ],
    type: 'text/javascript'
  }
}];

const rawBody = (obj) => ({ mode: 'raw', raw: JSON.stringify(obj, null, 2), options: { raw: { language: 'json' } } });
const formBody = (fields) => ({ mode: 'formdata', formdata: fields });

function url(pathStr, query) {
  const parts = pathStr.split('/').filter(Boolean);
  const u = {
    raw: `{{base_url}}/${parts.join('/')}${query ? '?' + query.map(q => `${q.key}=${q.value}`).join('&') : ''}`,
    host: ['{{base_url}}'],
    path: parts
  };
  if (query) u.query = query;
  return u;
}

function get(name, pathStr, token, query) {
  const item = { name, request: { method: 'GET', header: authHeader(token), url: url(pathStr, query) }, response: [] };
  return item;
}
function post(name, pathStr, token, body, isForm, description, events) {
  const item = {
    name,
    request: {
      method: 'POST',
      header: isForm ? authHeader(token) : jsonHeader(token),
      body,
      url: url(pathStr),
      description: description || ''
    },
    response: []
  };
  if (events) item.events = events;
  return item;
}
function put(name, pathStr, token, body, isForm) {
  return {
    name,
    request: {
      method: 'PUT',
      header: isForm ? authHeader(token) : jsonHeader(token),
      body,
      url: url(pathStr)
    },
    response: []
  };
}
function del(name, pathStr, token) {
  return { name, request: { method: 'DELETE', header: authHeader(token), url: url(pathStr) }, response: [] };
}

function crudFolder(folderName, basePath, createBody, putBody, token, isForm) {
  const bdy = isForm ? formBody(createBody) : rawBody(createBody);
  const updBdy = putBody ? (isForm ? formBody(putBody) : rawBody(putBody)) : bdy;
  return {
    name: folderName,
    item: [
      get(`List ${folderName}`, basePath, token),
      post(`Create ${folderName}`, basePath, token, bdy, isForm),
      get(`Get ${folderName} by ID`, `${basePath}/1`, token),
      put(`Update ${folderName}`, `${basePath}/1`, token, updBdy, isForm),
      del(`Delete ${folderName}`, `${basePath}/1`, token)
    ]
  };
}

// ── Collection ───────────────────────────────────────────────────────────────
const collection = {
  info: {
    _postman_id: 'garage-api-collection-v2',
    name: 'Garage API Collection',
    description: 'Complete API collection for the Garage management system.\nBase URL variable: {{base_url}} (default: http://localhost:3000/api)\n\nTip: Login endpoints have test scripts that auto-save tokens to collection variables.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  variable: [
    { key: 'base_url', value: 'http://localhost:3000/api', type: 'string' },
    { key: 'admin_token', value: '', type: 'string' },
    { key: 'user_token', value: '', type: 'string' }
  ],
  item: [
    // ── Health ────────────────────────────────────────────────────────────────
    {
      name: 'Health',
      item: [
        { name: 'Health Check (GET /health)', request: { method: 'GET', header: [], url: url('health'), description: 'Check if the API server is running.' }, response: [] }
      ]
    },

    // ── Auth ──────────────────────────────────────────────────────────────────
    {
      name: 'Auth',
      item: [
        post('Admin Login (POST /auth/admin/login)', 'auth/admin/login', null, rawBody({ email: 'admin@example.com', password: 'yourpassword' }), false, 'Login as admin. Returns JWT token + role=SuperAdmin.', loginTest('admin_token')),
        post('User Login (POST /auth/user/login)', 'auth/user/login', null, rawBody({ email: 'user@example.com', password: 'yourpassword' }), false, 'Login as company user. Returns JWT token + role from company_users → roles.', loginTest('user_token'))
      ]
    },

    // ── Admins ────────────────────────────────────────────────────────────────
    {
      name: 'Admins',
      item: [
        post('Admin Login (POST /admins/login)', 'admins/login', null, rawBody({ email: 'admin@example.com', password: 'yourpassword' }), false, 'Alternate admin login. Same as /auth/admin/login.', loginTest('admin_token')),
        get('List Admins', 'admins', 'admin_token'),
        post('Create Admin', 'admins', 'admin_token', rawBody({ name: 'Admin Name', email: 'newadmin@example.com', password: 'securepassword', phone: '+1234567890', status: 1 }), false),
        get('Get Admin by ID', 'admins/1', 'admin_token'),
        put('Update Admin', 'admins/1', 'admin_token', rawBody({ name: 'Updated Admin', phone: '+9876543210', status: 1 }), false),
        del('Delete Admin', 'admins/1', 'admin_token')
      ]
    },

    // ── Users ─────────────────────────────────────────────────────────────────
    {
      name: 'Users',
      item: [
        post('User Login (POST /users/login)', 'users/login', null, rawBody({ email: 'user@example.com', password: 'yourpassword' }), false, 'Alternate user login. Same as /auth/user/login.', loginTest('user_token')),
        get('List Users', 'users', 'admin_token'),
        post('Create User', 'users', 'admin_token', rawBody({ name: 'John Doe', email: 'john@example.com', password: 'securepassword', phone: '+1234567890', country: 'US', address: '123 Main St', status: 1 }), false),
        get('Get User by ID', 'users/1', 'admin_token'),
        put('Update User', 'users/1', 'admin_token', rawBody({ name: 'Updated Name', phone: '+9876543210', country: 'CA', address: '456 Another St' }), false),
        del('Delete User', 'users/1', 'admin_token')
      ]
    },

    // ── Roles ─────────────────────────────────────────────────────────────────
    crudFolder('Roles', 'roles', { name: 'Manager' }, { name: 'Senior Manager' }, 'admin_token', false),

    // ── Companies ─────────────────────────────────────────────────────────────
    {
      name: 'Companies',
      item: [
        get('List Companies', 'companies', 'admin_token'),
        post('Create Company', 'companies', 'admin_token',
          formBody([
            { key: 'owner_id', value: '1', type: 'text' },
            { key: 'email', value: 'company@example.com', type: 'text' },
            { key: 'phone', value: '+1234567890', type: 'text' },
            { key: 'country', value: 'US', type: 'text' },
            { key: 'address', value: '123 Business Ave', type: 'text' },
            { key: 'registration_no', value: 'REG-12345', type: 'text' },
            { key: 'status', value: '1', type: 'text' },
            { key: 'logo', type: 'file', src: '', description: 'Company logo image (optional)' }
          ]), true, 'Send as multipart/form-data. Logo is optional.'),
        get('Get Company by ID', 'companies/1', 'admin_token'),
        put('Update Company', 'companies/1', 'admin_token',
          formBody([
            { key: 'phone', value: '+9876543210', type: 'text' },
            { key: 'address', value: '456 New Address Ave', type: 'text' },
            { key: 'logo', type: 'file', src: '', description: 'New logo image (optional)' }
          ]), true),
        del('Delete Company', 'companies/1', 'admin_token')
      ]
    },

    // ── Company Users ─────────────────────────────────────────────────────────
    {
      name: 'Company Users',
      item: [
        get('List Company Users', 'company-users', 'admin_token'),
        post('Create Company User', 'company-users', 'admin_token', rawBody({ user_id: 2, company_id: 1, role_id: 1, status: 1 }), false),
        post('Create Company User (alt POST /company-users/users)', 'company-users/users', 'admin_token', rawBody({ user_id: 2, company_id: 1, role_id: 1, status: 1 }), false, 'Alternate endpoint, same as POST /company-users'),
        get('Get Company User by ID', 'company-users/1', 'admin_token'),
        put('Update Company User', 'company-users/1', 'admin_token', rawBody({ role_id: 2, status: 1 }), false),
        del('Delete Company User', 'company-users/1', 'admin_token')
      ]
    },

    // ── Packages ──────────────────────────────────────────────────────────────
    crudFolder('Packages', 'packages', { name: 'Basic Plan', monthly: 29.99, yearly: 299.99, status: 1 }, { name: 'Pro Plan', monthly: 49.99, yearly: 499.99 }, 'admin_token', false),

    // ── Package Histories ─────────────────────────────────────────────────────
    crudFolder('Package Histories', 'package-histories',
      { package_id: 1, company_id: 1, start_date: '2026-01-01T00:00:00.000Z', end_date: '2026-12-31T23:59:59.000Z', status: 1 },
      { end_date: '2027-12-31T23:59:59.000Z', status: 1 },
      'admin_token', false),

    // ── Customers ─────────────────────────────────────────────────────────────
    crudFolder('Customers', 'customers',
      { name: 'Jane Smith', email: 'jane@example.com', password: 'customerpassword', phone: '+1234567890', address: '789 Customer Lane', company_id: 1, created_by: 1, status: 1 },
      { name: 'Jane Updated', phone: '+9876543210', address: 'Updated Address' },
      'user_token', false),

    // ── Vehicles ──────────────────────────────────────────────────────────────
    crudFolder('Vehicles', 'vehicles',
      { customer_id: 1, name: 'My Car', make: 'Toyota', model: 'Camry', variant: 'LE', year: 2022, VIN: '1HGBH41JXMN109186', license_plate: 'ABC-1234', insured: 0, created_by: 1, status: 1 },
      { name: 'Updated Car', license_plate: 'XYZ-9999', insured: 1 },
      'user_token', false),

    // ── Insured Vehicles ──────────────────────────────────────────────────────
    crudFolder('Insured Vehicles', 'insured-vehicles',
      { vehicle_id: 1, insurance_number: 'INS-001', policy_number: 'POL-2026-001', expiry_date: '2027-12-31T00:00:00.000Z', claim_number: 'CLM-001', insurance_company: 'SafeDrive Insurance', insurance_company_phone: '+1800123456', status: 1 },
      { expiry_date: '2028-12-31T00:00:00.000Z', claim_number: 'CLM-002' },
      'user_token', false),

    // ── Appointments ──────────────────────────────────────────────────────────
    {
      name: 'Appointments',
      item: [
        get('List Appointments', 'appointments', 'user_token', [
          { key: 'company_id', value: '1', description: 'Filter by company ID (optional)' },
          { key: 'status', value: 'pending', description: 'Filter by status: pending|confirmed|completed|cancelled|no_show (optional)' }
        ]),
        post('Create Appointment', 'appointments', 'user_token', rawBody({ company_id: 1, customer_name: 'John Smith', customer_phone: '+1234567890', VIN: 12345678901234567, license_plate: 'ABC-1234', reservation_date: '2026-09-01T10:00:00.000Z', note: 'Oil change and brake inspection', status: 'pending' }), false, 'status: pending|confirmed|completed|cancelled|no_show'),
        get('Get Appointment by ID', 'appointments/1', 'user_token'),
        put('Update Appointment', 'appointments/1', 'user_token', rawBody({ status: 'confirmed', note: 'Confirmed – bring vehicle by 10am', reservation_date: '2026-09-02T09:00:00.000Z' }), false),
        del('Delete Appointment', 'appointments/1', 'user_token')
      ]
    },

    // ── Quotations ────────────────────────────────────────────────────────────
    {
      name: 'Quotations',
      item: [
        get('List Quotations', 'quotations', 'user_token'),
        post('Create Quotation', 'quotations', 'user_token',
          formBody([
            { key: 'company_id', value: '1', type: 'text' },
            { key: 'quotation_number', value: 'QUO-2026-001', type: 'text' },
            { key: 'vehicle_id', value: '1', type: 'text' },
            { key: 'mileage', value: '15000', type: 'text' },
            { key: 'note', value: 'Full service required', type: 'text' },
            { key: 'quotation_status', value: 'draft', type: 'text', description: 'draft|pending|approved|rejected|cancelled' },
            { key: 'subtotal', value: '500.00', type: 'text' },
            { key: 'discount', value: '50.00', type: 'text' },
            { key: 'tax_percentage', value: '10.00', type: 'text' },
            { key: 'tax_amount', value: '45.00', type: 'text' },
            { key: 'total', value: '495.00', type: 'text' },
            { key: 'creation_date', value: '2026-08-13', type: 'text' },
            { key: 'created_by', value: '1', type: 'text' },
            { key: 'documents', type: 'file', src: '', description: 'Optional document files (multi-upload)' }
          ]), true, 'Send as multipart/form-data. quotation_status: draft|pending|approved|rejected|cancelled'),
        get('Get Quotation by ID', 'quotations/1', 'user_token'),
        put('Update Quotation', 'quotations/1', 'user_token',
          formBody([
            { key: 'quotation_status', value: 'approved', type: 'text' },
            { key: 'note', value: 'Approved by customer', type: 'text' },
            { key: 'updated_by', value: '1', type: 'text' },
            { key: 'documents', type: 'file', src: '', description: 'New documents to add (optional)' }
          ]), true),
        del('Delete Quotation', 'quotations/1', 'user_token')
      ]
    },

    // ── Task Cards ────────────────────────────────────────────────────────────
    crudFolder('Task Cards', 'task-cards',
      { company_id: 1, quotation_id: 1, created_by: 1, status: 1 },
      { status: 1, updated_by: 1 },
      'user_token', false),

    // ── Tasks ─────────────────────────────────────────────────────────────────
    crudFolder('Tasks', 'tasks',
      { task_card_id: 1, type: 'service', description: 'Oil change – 5W-30 synthetic', qty: 1, task_status: 'pending', created_by: 1 },
      { task_status: 'Inprogress', qty: 2, updated_by: 1 },
      'user_token', false),

    // ── Invoices ──────────────────────────────────────────────────────────────
    crudFolder('Invoices', 'invoices',
      { company_id: 1, task_card_id: 1, invoice_status: 'draft', payment_status: 'pending', subtotal: 500.00, discount: 50.00, tax_percentage: 10.00, tax_amount: 45.00, total: 495.00, creation_date: '2026-08-13', created_by: 1 },
      { invoice_status: 'approved', payment_status: 'completed', updated_by: 1 },
      'user_token', false),

    // ── Invoice Payments ──────────────────────────────────────────────────────
    {
      name: 'Invoice Payments',
      item: [
        get('List Invoice Payments', 'invoice-payments', 'user_token'),
        post('Create Invoice Payment', 'invoice-payments', 'user_token',
          formBody([
            { key: 'company_id', value: '1', type: 'text' },
            { key: 'invoice_id', value: '1', type: 'text' },
            { key: 'total_amount', value: '495.00', type: 'text' },
            { key: 'paid_amount', value: '495.00', type: 'text' },
            { key: 'balance_amount', value: '0.00', type: 'text' },
            { key: 'payment_method', value: 'card', type: 'text', description: 'cash|card|bank_transfer|online' },
            { key: 'payment_status', value: 'pending', type: 'text', description: 'pending|not_verified|verified|rejected' },
            { key: 'payment_done_by', value: 'customer', type: 'text', description: 'company|customer' },
            { key: 'created_by', value: '1', type: 'text' },
            { key: 'picture', type: 'file', src: '', description: 'Proof of payment image (optional)' }
          ]), true, 'Supports optional proof-of-payment image upload.'),
        get('Get Invoice Payment by ID', 'invoice-payments/1', 'user_token'),
        put('Update Invoice Payment', 'invoice-payments/1', 'user_token',
          formBody([
            { key: 'payment_status', value: 'verified', type: 'text' },
            { key: 'verified_by', value: '1', type: 'text' },
            { key: 'picture', type: 'file', src: '', description: 'Updated proof image (optional)' }
          ]), true),
        del('Delete Invoice Payment', 'invoice-payments/1', 'user_token')
      ]
    },

    // ── Customer Reviews ──────────────────────────────────────────────────────
    crudFolder('Customer Reviews', 'customer-reviews',
      { task_card_id: 1, company_id: 1, rating: 5, review: 'Excellent service! The car looks brand new.', created_by: 1 },
      { rating: 4, review: 'Great service but took a bit longer than expected.' },
      'user_token', false),

    // ── Vehicle Maintenance Pictures ──────────────────────────────────────────
    {
      name: 'Vehicle Maintenance Pictures',
      item: [
        get('List Vehicle Maintenance Pictures', 'vehicle-maintenance-pictures', 'user_token'),
        post('Create Vehicle Maintenance Pictures', 'vehicle-maintenance-pictures', 'user_token',
          formBody([
            { key: 'task_card_id', value: '1', type: 'text' },
            { key: 'company_id', value: '1', type: 'text' },
            { key: 'picture_tag', value: 'before', type: 'text', description: 'before|after' },
            { key: 'created_by', value: '1', type: 'text' },
            { key: 'pictures', type: 'file', src: [], description: "Multiple files under field 'pictures'" }
          ]), true, 'picture_tag: before|after. Supports multiple file upload under field pictures.'),
        get('Get Vehicle Maintenance Picture by ID', 'vehicle-maintenance-pictures/1', 'user_token'),
        put('Update Vehicle Maintenance Pictures', 'vehicle-maintenance-pictures/1', 'user_token',
          formBody([
            { key: 'picture_tag', value: 'after', type: 'text' },
            { key: 'updated_by', value: '1', type: 'text' },
            { key: 'pictures', type: 'file', src: [], description: 'New pictures to add (optional)' }
          ]), true),
        del('Delete Vehicle Maintenance Picture', 'vehicle-maintenance-pictures/1', 'user_token')
      ]
    },

    // ── Twilio SMS Settings ───────────────────────────────────────────────────
    crudFolder('Twilio SMS Settings', 'twilio-sms-settings',
      { company_id: 1, sms_account_sid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', sms_auth_token: 'your_twilio_auth_token', sms_from_number: '+12345678901', created_by: 1 },
      { sms_from_number: '+19876543210', sms_auth_token: 'new_auth_token', updated_by: 1 },
      'admin_token', false),

    // ── Twilio WhatsApp Settings ──────────────────────────────────────────────
    crudFolder('Twilio WhatsApp Settings', 'twilio-whatsapp-settings',
      { company_id: 1, wa_account_sid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', wa_auth_token: 'your_wa_auth_token', wa_from_number: 'whatsapp:+14155238886', created_by: 1 },
      { wa_from_number: 'whatsapp:+19876543210', wa_auth_token: 'new_auth_token', updated_by: 1 },
      'admin_token', false),

    // ── SendGrid Settings ─────────────────────────────────────────────────────
    crudFolder('SendGrid Settings', 'sendgrid-settings',
      { company_id: 1, sendgrid_api_key: 'SG.xxxxxxxxxxxxxx', created_by: 1 },
      { sendgrid_api_key: 'SG.new_api_key_here', updated_by: 1 },
      'admin_token', false),

    // ── Messaging ─────────────────────────────────────────────────────────────
    {
      name: 'Messaging',
      item: [
        post('Send SMS (POST /sms)', 'sms', 'user_token',
          rawBody({ message: 'Your appointment is confirmed for tomorrow at 10am.', company_id: 1, customer_id: 1 }),
          false,
          'Send SMS using the company\'s Twilio SMS credentials (from twilio_sms_settings). Customer phone is looked up from customers table.'),
        post('Send WhatsApp (POST /whatsApp-sms)', 'whatsApp-sms', 'user_token',
          rawBody({ message: 'Your vehicle service is complete. Please come pick it up.', company_id: 1, customer_id: 1 }),
          false,
          'Send WhatsApp message using the company\'s Twilio WA credentials (from twilio_whatsapp_settings). Customer phone from customers table.'),
        post('Send Email (POST /email)', 'email', 'user_token',
          formBody([
            { key: 'message', value: 'Your invoice is ready. Please review the attached document.', type: 'text' },
            { key: 'company_id', value: '1', type: 'text' },
            { key: 'customer_id', value: '1', type: 'text' },
            { key: 'subject', value: 'Invoice Ready', type: 'text', description: 'Email subject (optional)' },
            { key: 'from_email', value: 'noreply@company.com', type: 'text', description: 'From email override (optional)' },
            { key: 'attachment', type: 'file', src: '', description: 'Optional attachment file (max 10MB). Field: attachment or file' }
          ]),
          true,
          'Send email using company SendGrid API key from sendgrid_settings. Customer email looked up from customers table. Optional attachment (max 10MB).'),
        post('Send Email (POST /send-email)', 'send-email', 'user_token',
          formBody([
            { key: 'message', value: 'Hello, your appointment has been confirmed.', type: 'text' },
            { key: 'company_id', value: '1', type: 'text' },
            { key: 'customer_id', value: '1', type: 'text' },
            { key: 'subject', value: 'Appointment Confirmation', type: 'text', description: 'Email subject (optional)' },
            { key: 'attachment', type: 'file', src: '', description: 'Optional attachment file (max 10MB)' }
          ]),
          true,
          'Alternate endpoint for sending email. Identical to POST /email.')
      ]
    }
  ]
};

const outputPath = path.resolve(__dirname, '..', 'garage-api-postman-collection.json');
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2), 'utf8');

const totalFolders = collection.item.length;
const totalRequests = collection.item.reduce((sum, f) => sum + (f.item ? f.item.length : 0), 0);
console.log(`✅ Postman collection written to: ${outputPath}`);
console.log(`   Folders : ${totalFolders}`);
console.log(`   Requests: ${totalRequests}`);

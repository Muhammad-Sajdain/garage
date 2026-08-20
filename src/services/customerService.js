const bcrypt = require('bcrypt');
const db = require('../../models');

const Customer = db.Customer;

const listCustomers = async (company_id) => {
  return Customer.findAll({
    where: {
      is_deleted: 0,
      ...(company_id ? { company_id } : {}),
    },
    order: [['id', 'ASC']],
  });
};

const getCustomerById = async (id) => {
  return Customer.findOne({
    where: { id, is_deleted: 0 },
  });
};

const createCustomer = async (payload) => {
  const {
    name,
    email,
    password,
    phone,
    address,
    password_reset = 0,
    company_id,
    created_by,
    status = 1,
  } = payload;

  const hashedPassword = await bcrypt.hash(password, 10);

  return Customer.create({
    name,
    email,
    password: hashedPassword,
    phone,
    address,
    password_reset,
    company_id,
    created_by,
    status,
    is_deleted: 0,
  });
};

const updateCustomer = async (id, payload) => {
  const customer = await Customer.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  const updateData = { ...payload };

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  await customer.update(updateData);
  return getCustomerById(id);
};

const deleteCustomer = async (id) => {
  const customer = await Customer.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  await customer.update({ is_deleted: 1 });
  return { success: true, message: 'Customer deleted successfully' };
};

module.exports = {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};

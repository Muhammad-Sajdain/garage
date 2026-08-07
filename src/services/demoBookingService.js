// src/services/demoBookingService.js
const db = require('../../models');
const { DemoBooking } = db;

// Fetch a single booking
const getBookingById = async (id) => {
  return DemoBooking.findOne({ where: { id, is_deleted: 0 } });
};

// List bookings with optional filters
const listBookings = async (filters = {}) => {
  const where = { is_deleted: 0, ...filters };
  return DemoBooking.findAll({ where, order: [['id', 'ASC']] });
};

// Create a new demo booking
const createBooking = async (payload) => {
  const {
    name,
    company_name,
    country,
    phone,
    email,
    status = 1,
    created_by,
    is_deleted = 0
  } = payload;

  const newBooking = await DemoBooking.create({
    name,
    company_name,
    country,
    phone,
    email,
    status,
    created_by,
    is_deleted
  });
  return getBookingById(newBooking.id);
};

// Update an existing booking (cannot modify id)
const updateBooking = async (id, payload) => {
  const booking = await DemoBooking.findOne({ where: { id, is_deleted: 0 } });
  if (!booking) throw new Error('DemoBooking not found');
  await booking.update(payload);
  return getBookingById(id);
};

// Soft‑delete a booking
const deleteBooking = async (id) => {
  const booking = await DemoBooking.findOne({ where: { id, is_deleted: 0 } });
  if (!booking) throw new Error('DemoBooking not found');
  await booking.update({ is_deleted: 1 });
  return { success: true, message: 'DemoBooking deleted' };
};

module.exports = { listBookings, getBookingById, createBooking, updateBooking, deleteBooking };

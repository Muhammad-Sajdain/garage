// src/services/appointmentService.js
const db = require('../../models');
const { Appointment, Company } = db;

// List all appointments (excluding soft‑deleted)
const listAppointments = async (filters = {}) => {
  const where = { is_deleted: 0, ...filters };
  return Appointment.findAll({
    where,
    include: [{ model: Company, as: 'company' }],
    order: [['id', 'ASC']],
  });
};

// Get a single appointment by id
const getAppointmentById = async (id) => {
  return Appointment.findOne({
    where: { id, is_deleted: 0 },
    include: [{ model: Company, as: 'company' }],
  });
};

// Create a new appointment
const createAppointment = async (payload) => {
  const {
    company_id,
    customer_name,
    customer_phone,
    VIN,
    license_plate,
    reservation_date,
    note = null,
    status = 'pending',
    created_by,
  } = payload;

  const newAppt = await Appointment.create({
    company_id,
    customer_name,
    customer_phone,
    VIN,
    license_plate,
    reservation_date,
    note,
    status,
    created_by,
    is_deleted: 0,
  });
  return getAppointmentById(newAppt.id);
};

// Update an existing appointment
const updateAppointment = async (id, payload) => {
  const appointment = await Appointment.findOne({
    where: { id, is_deleted: 0 },
  });
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  await appointment.update(payload);
  return getAppointmentById(id);
};

// Soft‑delete an appointment
const deleteAppointment = async (id) => {
  const appointment = await Appointment.findOne({
    where: { id, is_deleted: 0 },
  });
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  await appointment.update({ is_deleted: 1 });
  return { success: true, message: 'Appointment deleted successfully' };
};

module.exports = {
  listAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};

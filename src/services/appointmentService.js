// src/services/appointmentService.js
const { Op } = require('sequelize');
const db = require('../../models');
const { Appointment, Company } = db;

// List all appointments (excluding soft‑deleted)
const listAppointments = async (query = {}) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 100);
  const where = { is_deleted: 0 };

  if (query.company_id) where.company_id = query.company_id;
  if (query.status) where.status = query.status;

  const validDateFields = new Set(['createdAt', 'updatedAt', 'reservation_date']);
  const dateField = validDateFields.has(query.dateField) ? query.dateField : 'createdAt';
  if (query.startDate || query.endDate) {
    where[dateField] = {};
    if (query.startDate) where[dateField][Op.gte] = new Date(`${query.startDate}T00:00:00`);
    if (query.endDate) where[dateField][Op.lte] = new Date(`${query.endDate}T23:59:59.999`);
  }

  const { count, rows } = await Appointment.findAndCountAll({
    where,
    include: [{ model: Company, as: 'company' }],
    order: [['id', 'ASC']],
    limit,
    offset: (page - 1) * limit,
  });

  return {
    data: rows,
    total: count,
    totalPages: Math.max(Math.ceil(count / limit), 1),
  };
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

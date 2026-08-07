// src/controllers/appointmentController.js
const appointmentService = require('../services/appointmentService');

// List appointments (supports optional query filters)
const listAppointments = async (req, res) => {
  try {
    const filters = req.query; // e.g., ?status=confirmed&company_id=2
    const appointments = await appointmentService.listAppointments(filters);
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single appointment by ID
const getAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new appointment
const createAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update an existing appointment
const updateAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
    res.json({ success: true, data: appointment });
  } catch (error) {
    if (error.message === 'Appointment not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// Soft‑delete an appointment
const deleteAppointment = async (req, res) => {
  try {
    const result = await appointmentService.deleteAppointment(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'Appointment not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};

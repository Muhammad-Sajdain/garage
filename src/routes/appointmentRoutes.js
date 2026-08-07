// src/routes/appointmentRoutes.js
const express = require('express');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

// List appointments, optional query filters
router.get('/', appointmentController.listAppointments);
// Create new appointment
router.post('/', appointmentController.createAppointment);
// Get single appointment
router.get('/:id', appointmentController.getAppointment);
// Update appointment
router.put('/:id', appointmentController.updateAppointment);
// Soft delete appointment
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;

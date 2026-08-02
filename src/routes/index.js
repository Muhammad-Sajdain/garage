const express = require('express');
const { healthCheck } = require('../controllers/healthController');
const packageRoutes = require('./packageRoutes');
const adminRoutes = require('./adminRoutes');
const usersRoutes = require('./usersRoutes');
const authRoutes = require('./authRoutes');
const roleRoutes = require('./roleRoutes');
const companyRoutes = require('./companyRoutes');
const companyUserRoutes = require('./companyUserRoutes');
const packageHistoryRoutes = require('./packageHistoryRoutes');
const customerRoutes = require('./customerRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const insuredVehicleRoutes = require('./insuredVehicleRoutes');

const router = express.Router();

router.get('/health', healthCheck);
router.use('/auth', authRoutes);
router.use('/packages', packageRoutes);
router.use('/admins', adminRoutes);
router.use('/users', usersRoutes);
router.use('/roles', roleRoutes);
router.use('/companies', companyRoutes);
router.use('/company-users', companyUserRoutes);
router.use('/package-histories', packageHistoryRoutes);
router.use('/customers', customerRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/insured-vehicles', insuredVehicleRoutes);

module.exports = router;

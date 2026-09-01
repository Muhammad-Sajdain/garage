const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /dashboard/stats?company_id=123
router.get('/stats', dashboardController.getCompanyDashboardStats);
// GET /dashboard/overview?company_id=123
router.get('/overview', dashboardController.getCompanyRevenueOverview);
// GET /dashboard/tasks-doughnut?company_id=123
router.get('/tasks-doughnut', dashboardController.getCompanyTasksDoughnut);

module.exports = router;

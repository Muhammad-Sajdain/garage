const express = require('express');
const demoBookingController = require('../controllers/demoBookingController');

const router = express.Router();

router.get('/', demoBookingController.getDemoBookings);
router.post('/', demoBookingController.createDemoBooking);

module.exports = router;

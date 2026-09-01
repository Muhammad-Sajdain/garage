const express = require('express');
const salesController = require('../controllers/salesController');

const router = express.Router();

router.get('/', salesController.listSales);

module.exports = router;

'use strict';

const express = require('express');
const packageSaleController = require('../controllers/packageSaleController');

const router = express.Router();

router.get('/', packageSaleController.getPackageSales);

module.exports = router;

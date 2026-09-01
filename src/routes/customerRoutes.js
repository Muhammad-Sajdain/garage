const express = require('express');
const customerController = require('../controllers/customerController');

const router = express.Router();

router.get('/', customerController.getCustomers);
router.post('/', customerController.createCustomer);
router.post('/:id/reset-password', customerController.resetCustomerPassword);
router.get('/:id', customerController.getCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;

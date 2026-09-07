const express = require('express');
const controller = require('../controllers/towingInvoiceController');

const router = express.Router();

router.get('/', controller.listTowingInvoices);
router.post('/', controller.createTowingInvoice);
router.get('/:id', controller.getTowingInvoice);
router.put('/:id', controller.updateTowingInvoice);
router.delete('/:id', controller.deleteTowingInvoice);

module.exports = router;

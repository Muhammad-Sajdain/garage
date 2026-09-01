const express = require('express');
const controller = require('../controllers/companyExpenseController');

const router = express.Router();

router.get('/', controller.listCompanyExpenses);
router.post('/', controller.createCompanyExpense);
router.get('/:id', controller.getCompanyExpense);
router.put('/:id', controller.updateCompanyExpense);
router.delete('/:id', controller.deleteCompanyExpense);

module.exports = router;

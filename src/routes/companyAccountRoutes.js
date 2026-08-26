const express = require('express');
const controller = require('../controllers/companyAccountController');

const router = express.Router();

router.get('/', controller.listCompanyAccounts);
router.post('/', controller.createCompanyAccount);
router.get('/:id', controller.getCompanyAccount);
router.put('/:id', controller.updateCompanyAccount);
router.delete('/:id', controller.deleteCompanyAccount);

module.exports = router;

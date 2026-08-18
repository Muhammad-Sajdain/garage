const express = require('express');
const companyUserController = require('../controllers/companyUserController');

const router = express.Router();

router.get('/', companyUserController.getCompanyUsers);
router.post('/', companyUserController.createCompanyUser);
// router.post('/users', companyUserController.createCompanyUser);
router.get('/:id', companyUserController.getCompanyUser);
router.put('/:id', companyUserController.updateCompanyUser);
router.delete('/:id', companyUserController.deleteCompanyUser);

module.exports = router;

const express = require('express');
const companyController = require('../controllers/companyController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', companyController.getCompanies);
router.post('/', upload.single('logo'), companyController.createCompany);
router.get('/:id', companyController.getCompany);
router.put('/:id', upload.single('logo'), companyController.updateCompany);
router.delete('/:id', companyController.deleteCompany);

module.exports = router;

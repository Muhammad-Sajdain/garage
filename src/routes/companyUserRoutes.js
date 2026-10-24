const express = require('express');
const companyUserController = require('../controllers/companyUserController');
const uploadProfilePicture = require('../middleware/profilePictureUploadMiddleware');

const router = express.Router();

router.get('/', companyUserController.getCompanyUsers);
router.post('/', uploadProfilePicture.single('logo'), companyUserController.createCompanyUser);
// router.post('/users', companyUserController.createCompanyUser);
router.post('/:id/reset-password', companyUserController.resetCompanyUserPassword);
router.get('/:id', companyUserController.getCompanyUser);
router.put('/:id', uploadProfilePicture.single('logo'), companyUserController.updateCompanyUser);
router.delete('/:id', companyUserController.deleteCompanyUser);

module.exports = router;

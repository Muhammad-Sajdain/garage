const express = require('express');
const authController = require('../controllers/authController');
const uploadProfilePicture = require('../middleware/profilePictureUploadMiddleware');

const router = express.Router();

router.post('/admin/login', authController.loginAdmin);
router.post('/user/login', authController.loginUser);
router.post('/customer/login', authController.loginCustomer);
router.patch('/password', authController.changePassword);
router.patch('/profile', uploadProfilePicture.single('logo'), authController.updateProfile);

module.exports = router;

const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/admin/login', authController.loginAdmin);
router.post('/user/login', authController.loginUser);
router.post('/customer/login', authController.loginCustomer);
router.patch('/password', authController.changePassword);
router.patch('/profile', authController.updateProfile);

module.exports = router;

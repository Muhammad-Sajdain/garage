const express = require('express');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.loginAdmin);
router.get('/', adminController.getAdmins);
router.post('/', adminController.createAdmin);
router.get('/:id', adminController.getAdmin);
router.put('/:id', adminController.updateAdmin);
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;

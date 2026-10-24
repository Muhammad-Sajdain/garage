const express = require('express');
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');
const uploadProfilePicture = require('../middleware/profilePictureUploadMiddleware');

const router = express.Router();

router.post('/login', authController.loginUser);
router.get('/', usersController.getUsers);
router.post('/', uploadProfilePicture.single('logo'), usersController.createUser);
router.get('/:id', usersController.getUser);
router.put('/:id', uploadProfilePicture.single('logo'), usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;

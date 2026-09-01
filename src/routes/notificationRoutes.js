const express = require('express');
const controller = require('../controllers/notificationController');

const router = express.Router();

router.get('/', controller.listNotifications);
router.post('/', controller.createNotification);
router.get('/:id', controller.getNotification);
router.put('/:id', controller.updateNotification);
router.delete('/:id', controller.deleteNotification);

module.exports = router;

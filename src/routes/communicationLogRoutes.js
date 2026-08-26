const express = require('express');
const controller = require('../controllers/communicationLogController');

const router = express.Router();

router.get('/', controller.listCommunicationLogs);
router.post('/', controller.createCommunicationLog);
router.get('/:id', controller.getCommunicationLog);
router.put('/:id', controller.updateCommunicationLog);
router.delete('/:id', controller.deleteCommunicationLog);

module.exports = router;

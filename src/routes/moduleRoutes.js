const express = require('express');
const moduleController = require('../controllers/moduleController');

const router = express.Router();

router.get('/', moduleController.getModules);
router.post('/', moduleController.createModule);
router.get('/:id', moduleController.getModule);
router.put('/:id', moduleController.updateModule);
router.delete('/:id', moduleController.deleteModule);

module.exports = router;

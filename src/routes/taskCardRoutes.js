// src/routes/taskCardRoutes.js
const express = require('express');
const router = express.Router();
const taskCardController = require('../controllers/taskCardController');

router.get('/', taskCardController.listTaskCards);
router.get('/:id', taskCardController.getTaskCard);
router.post('/', taskCardController.createTaskCard);
router.put('/:id', taskCardController.updateTaskCard);
router.delete('/:id', taskCardController.deleteTaskCard);

module.exports = router;

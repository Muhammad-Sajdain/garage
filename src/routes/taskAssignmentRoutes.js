'use strict';

const express = require('express');
const taskAssignmentController = require('../controllers/taskAssignmentController');

const router = express.Router();

router.get('/', taskAssignmentController.listTaskAssignments);
router.post('/', taskAssignmentController.createTaskAssignment);
router.get('/:id', taskAssignmentController.getTaskAssignment);
router.put('/:id', taskAssignmentController.updateTaskAssignment);
router.delete('/:id', taskAssignmentController.deleteTaskAssignment);

module.exports = router;

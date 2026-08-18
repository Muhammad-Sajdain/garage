'use strict';

const taskAssignmentService = require('../services/taskAssignmentService');

const listTaskAssignments = async (req, res) => {
  try {
    const data = await taskAssignmentService.listTaskAssignments(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTaskAssignment = async (req, res) => {
  try {
    const data = await taskAssignmentService.getTaskAssignmentById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Task assignment not found' });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createTaskAssignment = async (req, res) => {
  try {
    const data = await taskAssignmentService.createTaskAssignment(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateTaskAssignment = async (req, res) => {
  try {
    const data = await taskAssignmentService.updateTaskAssignment(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    const status = error.message === 'Task assignment not found' ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

const deleteTaskAssignment = async (req, res) => {
  try {
    const data = await taskAssignmentService.deleteTaskAssignment(req.params.id);
    res.json(data);
  } catch (error) {
    const status = error.message === 'Task assignment not found' ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

module.exports = {
  listTaskAssignments,
  getTaskAssignment,
  createTaskAssignment,
  updateTaskAssignment,
  deleteTaskAssignment,
};

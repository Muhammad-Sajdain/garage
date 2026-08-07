// src/controllers/taskController.js
const taskService = require('../services/taskService');

// List tasks (optional filters)
const listTasks = async (req, res) => {
  try {
    const filters = req.query;
    const data = await taskService.listTasks(filters);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single task by id
const getTask = async (req, res) => {
  try {
    const data = await taskService.getTaskById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create task (must include task_card_id)
const createTask = async (req, res) => {
  try {
    const data = await taskService.createTask(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update task (cannot change task_card_id)
const updateTask = async (req, res) => {
  try {
    const data = await taskService.updateTask(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    if (err.message === 'Task not found') return res.status(404).json({ success: false, message: err.message });
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete (soft) task
const deleteTask = async (req, res) => {
  try {
    const result = await taskService.deleteTask(req.params.id);
    res.json(result);
  } catch (err) {
    if (err.message === 'Task not found') return res.status(404).json({ success: false, message: err.message });
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };

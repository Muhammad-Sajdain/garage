// src/services/taskService.js
const db = require('../../models');
const { Task } = db;

// List tasks (optional filters) include soft-deleted filter
const listTasks = async (filters = {}) => {
  const where = { is_deleted: 0, ...filters };
  return Task.findAll({ where, order: [['id', 'ASC']] });
};

const getTaskById = async (id) => {
  return Task.findOne({ where: { id, is_deleted: 0 } });
};

const createTask = async (payload) => {
  const { task_card_id, type, description = null, qty, task_status = 'pending', status = 1, created_by, updated_by = null, is_deleted = 0 } = payload;
  const newTask = await Task.create({ task_card_id, type, description, qty, task_status, status, created_by, updated_by, is_deleted });
  return getTaskById(newTask.id);
};

const updateTask = async (id, payload) => {
  const task = await Task.findOne({ where: { id, is_deleted: 0 } });
  if (!task) throw new Error('Task not found');
  // Prevent changing task_card_id
  const { task_card_id, ...updatable } = payload;
  await task.update(updatable);
  return getTaskById(id);
};

const deleteTask = async (id) => {
  const task = await Task.findOne({ where: { id, is_deleted: 0 } });
  if (!task) throw new Error('Task not found');
  await task.update({ is_deleted: 1 });
  return { success: true, message: 'Task deleted' };
};

module.exports = { listTasks, getTaskById, createTask, updateTask, deleteTask };

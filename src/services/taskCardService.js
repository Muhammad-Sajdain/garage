// src/services/taskCardService.js
const db = require('../../models');
const { TaskCard, Task } = db;

// List task cards (optional filters) with associated tasks
const listTaskCards = async (filters = {}) => {
  const where = { is_deleted: 0, ...filters };
  return TaskCard.findAll({ where, include: [{ model: Task, as: 'tasks' }], order: [['id', 'ASC']] });
};

// Get a single task card by ID with its tasks
const getTaskCardById = async (id) => {
  return TaskCard.findOne({ where: { id, is_deleted: 0 }, include: [{ model: Task, as: 'tasks' }] });
};

// Create a task card (optionally with tasks)
const createTaskCard = async (payload) => {
  const { company_id, quotation_id, status = 1, created_by, updated_by = null, is_deleted = 0, tasks = [] } = payload;
  const newCard = await TaskCard.create({ company_id, quotation_id, status, created_by, updated_by, is_deleted });
  // create associated tasks if provided
  if (Array.isArray(tasks) && tasks.length) {
    const taskRows = tasks.map(t => ({
      task_card_id: newCard.id,
      type: t.type,
      description: t.description,
      qty: t.qty,
      task_status: t.task_status || 'pending',
      status: t.status !== undefined ? t.status : 1,
      created_by: t.created_by || created_by,
      updated_by: t.updated_by || null,
      is_deleted: t.is_deleted !== undefined ? t.is_deleted : 0,
    }));
    await Task.bulkCreate(taskRows);
  }
  return getTaskCardById(newCard.id);
};

// Update a task card (cannot change company_id or quotation_id after creation)
const updateTaskCard = async (id, payload) => {
  const card = await TaskCard.findOne({ where: { id, is_deleted: 0 } });
  if (!card) throw new Error('TaskCard not found');
  // Prevent changing company_id and quotation_id
  const { company_id, quotation_id, tasks = [], ...updatable } = payload;
  await card.update(updatable);
  // Sync tasks
  if (Array.isArray(tasks)) {
    // Existing tasks for this card
    const existing = await Task.findAll({ where: { task_card_id: id, is_deleted: 0 } });
    const existingIds = existing.map(t => t.id);
    const payloadIds = tasks.filter(t => t.id).map(t => t.id);
    // Soft‑delete tasks that are missing from payload
    const toDelete = existingIds.filter(eid => !payloadIds.includes(eid));
    if (toDelete.length) await Task.update({ is_deleted: 1 }, { where: { id: toDelete } });
    // Upsert tasks from payload
    for (const t of tasks) {
      const { id: taskId, ...rest } = t;
      if (taskId) {
        // Update existing task (prevent changing task_card_id)
        await Task.update(rest, { where: { id: taskId } });
      } else {
        // Create new task linked to this card
        await Task.create({ ...rest, task_card_id: id });
      }
    }
  }
  return getTaskCardById(id);
};

// Soft‑delete a task card and cascade soft‑delete its tasks
const deleteTaskCard = async (id) => {
  const card = await TaskCard.findOne({ where: { id, is_deleted: 0 } });
  if (!card) throw new Error('TaskCard not found');
  await card.update({ is_deleted: 1 });
  await Task.update({ is_deleted: 1 }, { where: { task_card_id: id } });
  return { success: true, message: 'TaskCard deleted' };
};

module.exports = { listTaskCards, getTaskCardById, createTaskCard, updateTaskCard, deleteTaskCard };

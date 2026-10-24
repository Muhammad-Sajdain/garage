// src/services/taskCardService.js
const db = require('../../models');
const { TaskCard, Task, TaskAssignment, Quotation, QuotationDetail, Vehicle, Customer, Users } = db;

const taskInclude = {
  model: Task,
  as: 'tasks',
  include: [{
    model: TaskAssignment,
    as: 'assignments',
    where: { is_deleted: 0 },
    required: false,
    include: [{ model: Users, as: 'user', attributes: ['id', 'name', 'email'], required: false }],
  }],
};

const quotationInclude = {
  model: Quotation,
  as: 'quotation',
  include: [
    { model: QuotationDetail, as: 'details', where: { is_deleted: 0 }, required: false },
    {
      model: Vehicle,
      as: 'vehicle',
      include: [{ model: Customer, as: 'customer' }],
    },
  ],
};

const notifyTaskAssignees = async (taskCard, assignments) => {
  if (!assignments.length || !taskCard) return;

  const vin = taskCard.quotation?.vehicle?.VIN || taskCard.quotation?.vehicle?.vin || 'N/A';
  const taskCardNumber = taskCard.task_cards_number || taskCard.id;
  const notifications = assignments
    .filter(({ user_id }) => Number.isInteger(Number(user_id)) && Number(user_id) > 0)
    .map(({ user_id, task_id }) => ({
      company_id: taskCard.company_id,
      user_id: Number(user_id),
      scope: 'system',
      text: `You have been assigned Task No. ${task_id} under Task Card No. ${taskCardNumber} for Vehicle VIN: ${vin}.`,
      read: 0,
    }));

  if (notifications.length) await db.Notification.bulkCreate(notifications);
};

// List task cards (optional filters) with associated tasks
const listTaskCards = async (filters = {}) => {
  const where = { is_deleted: 0 };

  if (filters.company_id) where.company_id = Number(filters.company_id);
  if (filters.quotation_id) where.quotation_id = Number(filters.quotation_id);
  if (filters.vehicle_id) where['$quotation.vehicle_id$'] = Number(filters.vehicle_id);
  // accept `user` query param as shorthand for created_by
  if (filters.user) where.created_by = Number(filters.user);
  if (filters.status !== undefined) where.status = filters.status;

  return TaskCard.findAll({
    where,
    include: [
      { ...taskInclude, where: { is_deleted: 0 }, required: false },
      quotationInclude,
    ],
    order: [['id', 'ASC']],
  });
};

// Get a single task card by ID with its tasks
const getTaskCardById = async (id) => {
  return TaskCard.findOne({
    where: { id, is_deleted: 0 },
    include: [
      { ...taskInclude, where: { is_deleted: 0 }, required: false },
      quotationInclude,
    ],
  });
};

// Create a task card (optionally with tasks)
const createTaskCard = async (payload) => {
  const { company_id, quotation_id, task_cards_number, status = 1, created_by, updated_by = null, is_deleted = 0, tasks = [] } = payload;
  const newCard = await TaskCard.create({ company_id, quotation_id, task_cards_number, status, created_by, updated_by, is_deleted });
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
    const createdTasks = await Task.bulkCreate(taskRows);
    const assignments = createdTasks
      .map((task, index) => ({ task_id: task.id, user_id: tasks[index].assignedTo, status: 1, is_deleted: 0 }))
      .filter((assignment) => assignment.user_id);
    if (assignments.length) await TaskAssignment.bulkCreate(assignments);
    const assignedUsers = assignments.map(({ user_id, task_id }) => ({ user_id, task_id }));
    const createdCard = await getTaskCardById(newCard.id);
    await notifyTaskAssignees(createdCard, assignedUsers);
    return createdCard;
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
    const activeAssignments = existingIds.length
      ? await TaskAssignment.findAll({ where: { task_id: existingIds, is_deleted: 0 } })
      : [];
    const priorAssigneesByTask = new Map();
    for (const assignment of activeAssignments) {
      const current = priorAssigneesByTask.get(Number(assignment.task_id)) || new Set();
      current.add(Number(assignment.user_id));
      priorAssigneesByTask.set(Number(assignment.task_id), current);
    }
    const newlyAssignedUsers = [];
    const payloadIds = tasks.filter(t => t.id).map(t => t.id);
    // Soft‑delete tasks that are missing from payload
    const toDelete = existingIds.filter(eid => !payloadIds.includes(eid));
    if (toDelete.length) await Task.update({ is_deleted: 1 }, { where: { id: toDelete } });
    // Upsert tasks from payload
    for (const t of tasks) {
      const { id: taskId, assignedTo, ...rest } = t;
      if (taskId) {
        // Update existing task (prevent changing task_card_id)
        await Task.update(rest, { where: { id: taskId } });
        if (assignedTo !== undefined) {
          await TaskAssignment.update({ is_deleted: 1 }, { where: { task_id: taskId, is_deleted: 0 } });
          if (assignedTo) {
            await TaskAssignment.create({ task_id: taskId, user_id: assignedTo, status: 1, is_deleted: 0 });
            if (!priorAssigneesByTask.get(Number(taskId))?.has(Number(assignedTo))) {
              newlyAssignedUsers.push({ user_id: assignedTo, task_id: taskId });
            }
          }
        }
      } else {
        // Create new task linked to this card
        const newTask = await Task.create({ ...rest, task_card_id: id });
        if (assignedTo) {
          await TaskAssignment.create({ task_id: newTask.id, user_id: assignedTo, status: 1, is_deleted: 0 });
          newlyAssignedUsers.push({ user_id: assignedTo, task_id: newTask.id });
        }
      }
    }
    const updatedCard = await getTaskCardById(id);
    await notifyTaskAssignees(updatedCard, newlyAssignedUsers);
    return updatedCard;
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

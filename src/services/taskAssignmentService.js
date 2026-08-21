'use strict';

const { TaskAssignment, Task, TaskCard, Users } = require('../../models');

const assignmentIncludes = [
  {
    model: Task,
    as: 'task',
    required: false,
    include: [{ model: TaskCard, as: 'taskCard', required: false }],
  },
  {
    model: Users,
    as: 'user',
    attributes: ['id', 'name', 'email'],
    required: false,
  },
];

const listTaskAssignments = async (filters = {}) => {
  const { task_id, user_id, status } = filters;
  const where = { is_deleted: 0 };

  if (task_id !== undefined) where.task_id = task_id;
  if (user_id !== undefined) where.user_id = user_id;
  if (status !== undefined) where.status = status;

  return TaskAssignment.findAll({ where, include: assignmentIncludes, order: [['id', 'ASC']] });
};

const getTaskAssignmentById = (id) => TaskAssignment.findOne({
  where: { id, is_deleted: 0 },
  include: assignmentIncludes,
});

const createTaskAssignment = async (payload) => {
  const { task_id, user_id, status = 1, is_deleted = 0 } = payload;
  const assignment = await TaskAssignment.create({ task_id, user_id, status, is_deleted });
  return getTaskAssignmentById(assignment.id);
};

const updateTaskAssignment = async (id, payload) => {
  const assignment = await getTaskAssignmentById(id);
  if (!assignment) throw new Error('Task assignment not found');

  const validTaskStatuses = ['pending', 'Inprogress', 'compeleted', 'cancelled'];
  if (!validTaskStatuses.includes(payload.task_status)) {
    throw new Error('A valid task_status is required');
  }

  const task = await Task.findOne({ where: { id: assignment.task_id, is_deleted: 0 } });
  if (!task) throw new Error('Task not found');

  await task.update({ task_status: payload.task_status });
  return getTaskAssignmentById(id);
};

const deleteTaskAssignment = async (id) => {
  const assignment = await getTaskAssignmentById(id);
  if (!assignment) throw new Error('Task assignment not found');

  await assignment.update({ is_deleted: 1 });
  return { success: true, message: 'Task assignment deleted' };
};

module.exports = {
  listTaskAssignments,
  getTaskAssignmentById,
  createTaskAssignment,
  updateTaskAssignment,
  deleteTaskAssignment,
};

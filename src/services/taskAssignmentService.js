'use strict';

const { TaskAssignment } = require('../../models');

const listTaskAssignments = async (filters = {}) => {
  const { task_id, user_id, status } = filters;
  const where = { is_deleted: 0 };

  if (task_id !== undefined) where.task_id = task_id;
  if (user_id !== undefined) where.user_id = user_id;
  if (status !== undefined) where.status = status;

  return TaskAssignment.findAll({ where, order: [['id', 'ASC']] });
};

const getTaskAssignmentById = (id) => TaskAssignment.findOne({
  where: { id, is_deleted: 0 },
});

const createTaskAssignment = async (payload) => {
  const { task_id, user_id, status = 1, is_deleted = 0 } = payload;
  const assignment = await TaskAssignment.create({ task_id, user_id, status, is_deleted });
  return getTaskAssignmentById(assignment.id);
};

const updateTaskAssignment = async (id, payload) => {
  const assignment = await getTaskAssignmentById(id);
  if (!assignment) throw new Error('Task assignment not found');

  const { id: ignoredId, is_deleted: ignoredDeleted, ...updatable } = payload;
  await assignment.update(updatable);
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

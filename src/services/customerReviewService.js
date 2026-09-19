// src/services/customerReviewService.js
const { Op } = require('sequelize');
const db = require('../../models');
const { CustomerReview, TaskCard } = db;

// Helper to fetch with optional associations
const getReviewById = async (id) => {
  return CustomerReview.findOne({
    where: { id, is_deleted: 0 },
    include: [{ model: TaskCard, as: 'taskCard' }]
  });
};

// List reviews with optional filters
const listReviews = async (query = {}) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 100);
  const where = { is_deleted: 0 };

  if (query.company_id) where.company_id = query.company_id;
  if (query.status) where.status = query.status;
  if (query.task_card_id) where.task_card_id = query.task_card_id;

  const validDateFields = new Set(['createdAt', 'updatedAt']);
  const dateField = validDateFields.has(query.dateField) ? query.dateField : 'createdAt';
  if (query.startDate || query.endDate) {
    where[dateField] = {};
    if (query.startDate) where[dateField][Op.gte] = new Date(`${query.startDate}T00:00:00`);
    if (query.endDate) where[dateField][Op.lte] = new Date(`${query.endDate}T23:59:59.999`);
  }

  const { count, rows } = await CustomerReview.findAndCountAll({
    where,
    include: [{ model: TaskCard, as: 'taskCard' }],
    order: [['id', 'ASC']],
    limit,
    offset: (page - 1) * limit,
  });

  return {
    data: rows,
    total: count,
    totalPages: Math.max(Math.ceil(count / limit), 1),
  };
};

// Create a new review
const createReview = async (payload) => {
  const {
    task_card_id,
    company_id,
    rating,
    review = null,
    status = 1,
    created_by,
    is_deleted = 0
  } = payload;

  const newReview = await CustomerReview.create({
    task_card_id,
    company_id,
    rating,
    review,
    status,
    created_by,
    is_deleted
  });
  return getReviewById(newReview.id);
};

// Update an existing review (cannot change task_card_id/company_id)
const updateReview = async (id, payload) => {
  const review = await CustomerReview.findOne({ where: { id, is_deleted: 0 } });
  if (!review) throw new Error('CustomerReview not found');
  const { task_card_id, company_id, ...updatable } = payload;
  await review.update(updatable);
  return getReviewById(id);
};

// Soft‑delete a review
const deleteReview = async (id) => {
  const review = await CustomerReview.findOne({ where: { id, is_deleted: 0 } });
  if (!review) throw new Error('CustomerReview not found');
  await review.update({ is_deleted: 1 });
  return { success: true, message: 'CustomerReview deleted' };
};

module.exports = { listReviews, getReviewById, createReview, updateReview, deleteReview };

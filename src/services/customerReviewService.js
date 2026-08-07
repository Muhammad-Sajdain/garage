// src/services/customerReviewService.js
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
const listReviews = async (filters = {}) => {
  const where = { is_deleted: 0, ...filters };
  return CustomerReview.findAll({ where, include: [{ model: TaskCard, as: 'taskCard' }], order: [['id', 'ASC']] });
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

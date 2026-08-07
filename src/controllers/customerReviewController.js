// src/controllers/customerReviewController.js
const customerReviewService = require('../services/customerReviewService');

// POST /customer-reviews
const createReview = async (req, res) => {
  try {
    const review = await customerReviewService.createReview(req.body);
    res.status(201).json(review);
  } catch (err) {
    console.error('Create review error:', err);
    res.status(400).json({ error: err.message });
  }
};

// GET /customer-reviews/:id
const getReview = async (req, res) => {
  try {
    const review = await customerReviewService.getReviewById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    console.error('Get review error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /customer-reviews
const listReviews = async (req, res) => {
  try {
    const reviews = await customerReviewService.listReviews(req.query);
    res.json(reviews);
  } catch (err) {
    console.error('List reviews error:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /customer-reviews/:id
const updateReview = async (req, res) => {
  try {
    const review = await customerReviewService.updateReview(req.params.id, req.body);
    res.json(review);
  } catch (err) {
    console.error('Update review error:', err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE /customer-reviews/:id (soft delete)
const deleteReview = async (req, res) => {
  try {
    const result = await customerReviewService.deleteReview(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(400).json({ error: err.message });
  }
};

module.exports = { createReview, getReview, listReviews, updateReview, deleteReview };

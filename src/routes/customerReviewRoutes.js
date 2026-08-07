// src/routes/customerReviewRoutes.js
const express = require('express');
const router = express.Router();
const customerReviewController = require('../controllers/customerReviewController');

router.post('/', customerReviewController.createReview);
router.get('/:id', customerReviewController.getReview);
router.get('/', customerReviewController.listReviews);
router.put('/:id', customerReviewController.updateReview);
router.delete('/:id', customerReviewController.deleteReview);

module.exports = router;

// src/routes/quotationRoutes.js
const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const upload = require('../middleware/quotationUploadMiddleware');

// List all quotations (optionally with query filters)
router.get('/', quotationController.listQuotations);

// Download an uploaded quotation document as an attachment
router.get('/documents/:documentId/download', quotationController.downloadQuotationDocument);

// Get a single quotation by id
router.get('/:id', quotationController.getQuotation);

// Create a quotation – accept multiple document files under field 'documents'
router.post('/', upload.array('documents'), quotationController.createQuotation);

// Update a quotation – also accept new document files (adds to existing)
router.put('/:id', upload.array('documents'), quotationController.updateQuotation);

// Soft‑delete a quotation
router.delete('/:id', quotationController.deleteQuotation);

module.exports = router;

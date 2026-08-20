// src/controllers/quotationController.js
const quotationService = require('../services/quotationService');
const path = require('path');
const fs = require('fs');
const config = require('dotenv').config(); // to get env if needed

// Helper to build full URL for documents
const buildDocumentUrl = (req, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get('host')}/quotation_files/${encodeURIComponent(filename)}`;
};

// multipart/form-data fields are received as strings. Decode fields that the
// quotation service expects as arrays before passing the payload onward.
const parseMultipartPayload = (payload) => {
  if (typeof payload.details === 'string') {
    try {
      payload.details = JSON.parse(payload.details);
    } catch {
      throw new Error('Invalid quotation details payload');
    }
  }
  return payload;
};

const listQuotations = async (req, res) => {
  try {
    const filters = req.query; // allow filtering by status, etc.
    const quotations = await quotationService.listQuotations(filters);
    // prepend document URLs
    const formatted = quotations.map(q => {
      const plain = q.toJSON ? q.toJSON() : q;
      if (plain.documents) {
        plain.documents = plain.documents.map(doc => ({
          ...doc,
          url: buildDocumentUrl(req, doc.document),
        }));
      }
      return plain;
    });
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getQuotation = async (req, res) => {
  try {
    const quotation = await quotationService.getQuotationById(req.params.id);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });
    const plain = quotation.toJSON ? quotation.toJSON() : quotation;
    if (plain.documents) {
      plain.documents = plain.documents.map(doc => ({
        ...doc,
        url: buildDocumentUrl(req, doc.document),
      }));
    }
    res.json({ success: true, data: plain });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const downloadQuotationDocument = async (req, res) => {
  try {
    const document = await quotationService.getQuotationDocumentById(req.params.documentId);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    const filename = path.basename(document.document);
    const filePath = path.join(__dirname, '../../uploads/quotations_files', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Uploaded file not found' });
    }

    res.download(filePath, filename);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// payload may contain "details" array; files are optional (multiple)
const createQuotation = async (req, res) => {
  try {
    const payload = parseMultipartPayload(req.body);
    const files = req.files; // multer puts array under field name "documents"
    const quotation = await quotationService.createQuotation(payload, files);
    res.status(201).json({ success: true, data: quotation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateQuotation = async (req, res) => {
  try {
    const payload = parseMultipartPayload(req.body);
    const files = req.files;
    const quotation = await quotationService.updateQuotation(req.params.id, payload, files);
    res.json({ success: true, data: quotation });
  } catch (error) {
    if (error.message === 'Quotation not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteQuotation = async (req, res) => {
  try {
    const result = await quotationService.deleteQuotation(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'Quotation not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  listQuotations,
  getQuotation,
  downloadQuotationDocument,
  createQuotation,
  updateQuotation,
  deleteQuotation,
};

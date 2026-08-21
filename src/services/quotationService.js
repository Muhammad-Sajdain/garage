// src/services/quotationService.js
const db = require('../../models');
const { Quotation, QuotationDetail, QuotationDocument, Vehicle, Customer } = db;

const quotationIncludes = [
  { model: QuotationDetail, as: 'details', where: { is_deleted: 0 }, required: false },
  { model: QuotationDocument, as: 'documents', where: { is_deleted: 0 }, required: false },
  {
    model: Vehicle,
    as: 'vehicle',
    include: [{ model: Customer, as: 'customer' }],
  },
];

// List quotations with optional filters, include details & documents
const listQuotations = async (filters = {}) => {
  const where = { is_deleted: 0, ...filters };
  return Quotation.findAll({
    where,
    include: quotationIncludes,
    order: [['id', 'ASC']],
  });
};

// Get single quotation by ID
const getQuotationById = async (id) => {
  return Quotation.findOne({
    where: { id, is_deleted: 0 },
    include: quotationIncludes,
  });
};

const getQuotationDocumentById = async (documentId) => {
  return QuotationDocument.findOne({ where: { id: documentId, is_deleted: 0 } });
};

// Create quotation with optional file uploads
const createQuotation = async (payload, files = []) => {
  const {
    quotation_number,
    company_id,
    vehicle_id,
    mileage,
    note,
    quotation_status = 'draft',
    subtotal,
    discount,
    discount_percentage,
    tax_amount,
    tax_percentage,
    total,
    creation_date,
    created_by,
    updated_by = null,
    status = 1,
    is_deleted = 0,
    details = [], // array of detail objects
  } = payload;



  // Create the main quotation record
  const newQuotation = await Quotation.create({
    quotation_number,
    company_id,
    vehicle_id,
    mileage,
    note,
    quotation_status,
    subtotal,
    discount,
    discount_percentage,
    tax_amount,
    tax_percentage,
    total,
    creation_date,
    created_by,
    updated_by,
    status,
    is_deleted,
  });

  // Create related details if provided
  if (Array.isArray(details) && details.length) {
    const detailRows = details.map(d => ({ ...d, quotation_id: newQuotation.id }));
    await QuotationDetail.bulkCreate(detailRows);
  }

  // Handle file uploads – each file saved by multer, store filename
  if (files && files.length) {
    const docRows = files.map(f => ({
      quotation_id: newQuotation.id,
      document: f.filename, // store just the filename; URL can be built later
    }));
    await QuotationDocument.bulkCreate(docRows);
  }

  return getQuotationById(newQuotation.id);
};

// Update quotation (including details and optionally new files)
const updateQuotation = async (id, payload, files = []) => {
  const quotation = await Quotation.findOne({ where: { id, is_deleted: 0 } });
  if (!quotation) throw new Error('Quotation not found');

  // Update main fields
  // Prevent company_id from being changed during update
  const detailsProvided = Object.prototype.hasOwnProperty.call(payload, 'details');
  if (detailsProvided && !Array.isArray(payload.details)) {
    throw new Error('Quotation details must be an array');
  }

  const { company_id, details, ...updatableFields } = payload;
  await quotation.update(updatableFields);

  // Replace details if payload contains a 'details' array
  if (detailsProvided) {
    // Soft‑delete existing details
    await QuotationDetail.update({ is_deleted: 1 }, { where: { quotation_id: id, is_deleted: 0 } });
    // Insert new ones
    if (details.length) {
      const newDetails = details.map(d => ({ ...d, quotation_id: id }));
      await QuotationDetail.bulkCreate(newDetails);
    }
  }

  // Add any new uploaded documents (keep existing ones)
  if (files && files.length) {
    const docRows = files.map(f => ({ quotation_id: id, document: f.filename }));
    await QuotationDocument.bulkCreate(docRows);
  }

  return getQuotationById(id);
};

// Soft‑delete a quotation and cascade soft‑delete its children
const deleteQuotation = async (id) => {
  const quotation = await Quotation.findOne({ where: { id, is_deleted: 0 } });
  if (!quotation) throw new Error('Quotation not found');

  await quotation.update({ is_deleted: 1 });
  await QuotationDetail.update({ is_deleted: 1 }, { where: { quotation_id: id } });
  await QuotationDocument.update({ is_deleted: 1 }, { where: { quotation_id: id } });
  return { success: true, message: 'Quotation deleted successfully' };
};

module.exports = {
  listQuotations,
  getQuotationById,
  getQuotationDocumentById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
};

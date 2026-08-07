// src/controllers/taskCardController.js
const taskCardService = require('../services/taskCardService');

// List task cards (optional filters)
const listTaskCards = async (req, res) => {
  try {
    const filters = req.query;
    const data = await taskCardService.listTaskCards(filters);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get a single task card by id
const getTaskCard = async (req, res) => {
  try {
    const data = await taskCardService.getTaskCardById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'TaskCard not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create task card
const createTaskCard = async (req, res) => {
  try {
    const data = await taskCardService.createTaskCard(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update task card (company_id/quotation_id immutable)
const updateTaskCard = async (req, res) => {
  try {
    const data = await taskCardService.updateTaskCard(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    if (err.message === 'TaskCard not found') return res.status(404).json({ success: false, message: err.message });
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete (soft) task card
const deleteTaskCard = async (req, res) => {
  try {
    const result = await taskCardService.deleteTaskCard(req.params.id);
    res.json(result);
  } catch (err) {
    if (err.message === 'TaskCard not found') return res.status(404).json({ success: false, message: err.message });
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { listTaskCards, getTaskCard, createTaskCard, updateTaskCard, deleteTaskCard };

const vehicleService = require('../services/vehicleService');

const getVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.listVehicles({
      customer_id: req.query.customer_id,
      company_id: req.query.company_id,
    });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    return res.json({ success: true, data: vehicle });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createVehicle = async (req, res) => {
  try {
    // normalize insured flag
    const insuredFlag = req.body.insured === 1 || req.body.insured === '1' || req.body.insured === true;
    const payload = { ...req.body, insured: insuredFlag ? 1 : 0 };

    // when insured, ensure claim_number is present either in insuranceDetails or top-level
    if (payload.insured === 1) {
      const details = payload.insuranceDetails || {};
      const claim = details.claim_number ?? payload.claim_number ?? details.claimNumber ?? payload.claimNumber;
      if (!claim || String(claim).trim() === '') {
        return res.status(400).json({ success: false, message: 'claim_number is required when insured' });
      }
      // normalize claim into insuranceDetails
      payload.insuranceDetails = { ...details, claim_number: claim };
    }

    const vehicle = await vehicleService.createVehicle(payload);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    // Sequelize validation errors contain `errors` array with messages
    if (error && Array.isArray(error.errors)) {
      const msg = error.errors.map((e) => e.message).join('; ');
      return res.status(400).json({ success: false, message: msg || error.message || 'Validation error' });
    }
    res.status(400).json({ success: false, message: error.message || 'Validation error' });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const insuredFlag = req.body.insured === 1 || req.body.insured === '1' || req.body.insured === true;
    const payload = { ...req.body, insured: insuredFlag ? 1 : 0 };

    if (payload.insured === 1) {
      const details = payload.insuranceDetails || {};
      const claim = details.claim_number ?? payload.claim_number ?? details.claimNumber ?? payload.claimNumber;
      if (!claim || String(claim).trim() === '') {
        return res.status(400).json({ success: false, message: 'claim_number is required when insured' });
      }
      payload.insuranceDetails = { ...details, claim_number: claim };
    }

    const vehicle = await vehicleService.updateVehicle(req.params.id, payload);
    res.json({ success: true, data: vehicle });
  } catch (error) {
    if (error.message === 'Vehicle not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error && Array.isArray(error.errors)) {
      const msg = error.errors.map((e) => e.message).join('; ');
      return res.status(400).json({ success: false, message: msg || error.message || 'Validation error' });
    }
    return res.status(400).json({ success: false, message: error.message || 'Validation error' });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const result = await vehicleService.deleteVehicle(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'Vehicle not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};

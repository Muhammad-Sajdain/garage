const express = require('express');
const insuredVehicleController = require('../controllers/insuredVehicleController');

const router = express.Router();

router.get('/', insuredVehicleController.getInsuredVehicles);
router.post('/', insuredVehicleController.createInsuredVehicle);
router.get('/:id', insuredVehicleController.getInsuredVehicle);
router.put('/:id', insuredVehicleController.updateInsuredVehicle);
router.delete('/:id', insuredVehicleController.deleteInsuredVehicle);

module.exports = router;

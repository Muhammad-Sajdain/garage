const express = require('express');
const packageHistoryController = require('../controllers/packageHistoryController');

const router = express.Router();

router.get('/', packageHistoryController.getPackageHistories);
router.post('/', packageHistoryController.createPackageHistory);
router.get('/:id', packageHistoryController.getPackageHistory);
router.put('/:id', packageHistoryController.updatePackageHistory);
router.delete('/:id', packageHistoryController.deletePackageHistory);

module.exports = router;

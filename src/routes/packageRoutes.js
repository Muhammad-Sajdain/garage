const express = require('express');
const packageController = require('../controllers/packageController');

const router = express.Router();

router.get('/', packageController.getPackages);
router.post('/', packageController.createPackage);
router.get('/:id', packageController.getPackage);
router.put('/:id', packageController.updatePackage);
router.delete('/:id', packageController.deletePackage);

module.exports = router;

const express = require('express');
const assetController = require('../controllers/assetController.js');

const router = express.Router();

router.get('/', assetController.getAssets);
router.post('/filters', assetController.getFilters);
router.post('/filters/subTypes', assetController.getSubTypeFilters);
router.get('/:id', assetController.getAsset);
router.patch("/update", assetController.updateAsset);

module.exports = router;

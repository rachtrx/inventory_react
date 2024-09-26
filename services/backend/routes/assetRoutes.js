const express = require('express');
const assetController = require('../controllers/assetController.js');

const router = express.Router();

router.post('/', assetController.getAssets);
router.post('/filters', assetController.getFilters)
router.get('/:id', assetController.getAsset);
router.patch("/update", assetController.updateAsset);
router.post('/search', assetController.searchAssets);

module.exports = router;

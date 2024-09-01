const express = require('express');
const assetController = require('../controllers/assetController.js');

const router = express.Router();

router.post('/', assetController.getAssets);
router.post('/filters', assetController.getFilters)
router.get('/:id', assetController.getAsset);
router.post("/bookmark", assetController.bookmarkAsset);
router.post('/search', assetController.searchAssets);

module.exports = router;

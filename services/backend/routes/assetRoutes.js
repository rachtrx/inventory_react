const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

router.get('/', assetController.getAssets);
router.get('/:id', assetController.getAsset);
router.post("/bookmark", assetController.bookmarkAsset);
router.post('/search', assetController.searchAssets);

module.exports = router;

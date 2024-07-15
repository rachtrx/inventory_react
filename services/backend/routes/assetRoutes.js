const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

router.get('/', assetController.getAssets);
router.post('/show/:id', assetController.showAsset);
router.patch("/bookmark/:id", assetController.bookmarkAsset);

module.exports = router;

const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

<<<<<<< HEAD
router.post('/', assetController.getAssets);
router.post('/filters', assetController.getFilters)
=======
router.get('/', assetController.getAssets);
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
router.get('/:id', assetController.getAsset);
router.post("/bookmark", assetController.bookmarkAsset);
router.post('/search', assetController.searchAssets);

module.exports = router;

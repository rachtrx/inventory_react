const express = require('express');
const assetController = require('../controllers/assetController.js');
const formAssetController = require('../controllers/formAssetController.js');
const formAssetTagController = require('../controllers/formAssetTagController.js');

const router = express.Router();

router.get('/', assetController.getAssets);
router.get('/filters/all', assetController.getAllFilters);
router.post('/filters', assetController.getFilters);
router.post('/filters/subTypes', assetController.getSubTypeFilters);
router.get('/:id', assetController.getAsset);
router.patch("/update", assetController.updateAsset);

router.post('/add/type', formAssetController.createNewAssetType);
router.post('/add/subType', formAssetController.createNewAssetSubType);
router.post('/add/vendor', formAssetController.createNewVendor);

router.post('/add/asset', formAssetController.add);

router.get('/del/asset', formAssetController.loadAstDel);
router.post('/del/asset', formAssetController.del);


router.post('/add/tag', formAssetTagController.createNewTag);

router.get('/tag/asset', formAssetTagController.loadAddAssets)
router.get('/untag/asset', formAssetTagController.loadDelAssets)

router.post('/tag/asset', formAssetTagController.addAssetTag)
router.post('/untag/asset', formAssetTagController.delAssetTag)

module.exports = router;

const express = require('express');
const assetController = require('@controllers/assets/assetController.js');
const formAssetController = require('@controllers/assets/formAssetController.js');
const formAssetTagController = require('@controllers/assets/formAssetTagController.js');

const router = express.Router();

router.get('/', assetController.getAllItemsEndpoint);
router.get('/excel', assetController.getAllItemsExcelEndpoint);

router.get('/filters/all', assetController.getAllFilters);
router.post('/filters', assetController.getFilters);
router.post('/filters/subTypes', assetController.getSubTypeFilters);
router.get('/:id', assetController.getAsset);
router.patch("/update", assetController.updateAsset);

router.post('/add/type', formAssetController.createNewAssetType);
router.post('/add/subType', formAssetController.createNewAssetSubType);
router.post('/add/vendor', formAssetController.createNewVendor);

router.post('/add/asset', formAssetController.add);

router.post('/del/asset/lookup', formAssetController.loadAstDel);
router.post('/del/asset', formAssetController.del);

router.post('/add/tag', formAssetTagController.createNewTag);

router.post('/tag/asset/lookup', formAssetTagController.loadAddAssets)
router.post('/untag/asset/lookup', formAssetTagController.loadDelAssets)

router.post('/tag/asset', formAssetTagController.addAssetTag)
router.post('/untag/asset', formAssetTagController.delAssetTag)

// router.post('/force-del', formAssetTagController.forceDel)

module.exports = router;

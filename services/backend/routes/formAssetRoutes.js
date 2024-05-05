const express = require('express');
const router = express.Router();
const formAssetController = require('../controllers/formAssetController');

router.get('/types', formAssetController.getAssetTypes);
router.get('/typeVariants', formAssetController.getAssetTypeVariants);
router.post('/create', formAssetController.createAsset); // create a variant
router.post('/register', formAssetController.registerAsset); // register an asset

// router.patch("/update/:id", formAssetController.updateAsset);  
router.delete("/:id/delete", formAssetController.deleteAsset);

module.exports = router;

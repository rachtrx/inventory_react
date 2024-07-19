const express = require('express');
const router = express.Router();
const formAssetController = require('../controllers/formAssetController');

router.get('/types', formAssetController.getAssetTypes);
router.get('/typeVariants', formAssetController.getAssetTypeVariants);
router.post('/add', formAssetController.addAsset); // create a variant

// router.patch("/update/:id", formAssetController.updateAsset);  
router.delete("/condemn", formAssetController.condemnAsset);

module.exports = router;

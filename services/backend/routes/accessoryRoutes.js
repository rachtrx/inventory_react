const express = require('express');
const accessoryController = require('../controllers/accessoryController.js');

const router = express.Router();

router.get('/', accessoryController.getAccesories);
router.get('/:id', accessoryController.getAccType);
router.post('/filters', accessoryController.getFilters);
router.post('/getSuggested', accessoryController.getSuggestedAccessories);

// router.post('/updateAssetTypeSuggestion', accessoryController.updateAssetTypeSuggestion);
// router.post('/updateVariantSuggestion', accessoryController.updateVariantSuggestion);

router.post('/add', accessoryController.createAccessoryEndpoint); // create peripheral
router.post('/addTxn', accessoryController.addAccessoriesEndpoint);
// router.delete("/:id/archive", accessoryController.archivePeripheral);

module.exports = router;

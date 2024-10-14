const express = require('express');
const accessoryController = require('../controllers/accessoryController.js');

const router = express.Router();

router.post('/', accessoryController.getAccesories);
router.post('/filters', accessoryController.getFilters);
router.post('/search', accessoryController.searchAccessories);
router.post('/getSuggested', accessoryController.getSuggestedAccessories);

// router.post('/updateAssetTypeSuggestion', accessoryController.updateAssetTypeSuggestion);
// router.post('/updateVariantSuggestion', accessoryController.updateVariantSuggestion);

router.post('/add', accessoryController.addAccessoriesEndpoint); // create peripheral

// router.delete("/:id/archive", accessoryController.archivePeripheral);

module.exports = router;

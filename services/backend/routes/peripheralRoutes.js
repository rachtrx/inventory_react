const express = require('express');
const router = express.Router();
const peripheralController = require('../controllers/peripheralController');

router.post('/', peripheralController.getPeripherals);
router.post('/filters', peripheralController.getFilters);
router.post('/search', peripheralController.searchPeripherals);
router.post('/getSuggested', peripheralController.getSuggestedPeripherals);

// router.post('/updateAssetTypeSuggestion', peripheralController.updateAssetTypeSuggestion);
// router.post('/updateVariantSuggestion', peripheralController.updateVariantSuggestion);

router.post('/add', peripheralController.addPeripheralsEndpoint); // create peripheral

// router.delete("/:id/archive", peripheralController.archivePeripheral);

module.exports = router;

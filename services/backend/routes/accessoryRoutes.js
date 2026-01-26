const express = require('express');
const accessoryController = require('@controllers/accessories/accessoryController.js');

const router = express.Router();

router.get('/', accessoryController.getAllItemsEndpoint);
router.get('/excel', accessoryController.getAllItemsExcelEndpoint);
router.get('/:id', accessoryController.getAccType);
router.post('/filters', accessoryController.getFilters);
router.post('/getSuggested', accessoryController.getSuggestedAccessories);

router.get('/loans/:id', accessoryController.getOngoingLoans);
router.get('/reservations/:id', accessoryController.getOngoingReservations);

// router.post('/updateAssetTypeSuggestion', accessoryController.updateAssetTypeSuggestion);
// router.post('/updateVariantSuggestion', accessoryController.updateVariantSuggestion);

router.post('/add', accessoryController.createAccessoryEndpoint); // create peripheral
router.post('/addTxn', accessoryController.addAccessoriesEndpoint);
// router.delete("/:id/archive", accessoryController.archivePeripheral);

module.exports = router;

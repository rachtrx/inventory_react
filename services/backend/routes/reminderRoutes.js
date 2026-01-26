const express = require('express');
const reminderController = require('@controllers/events/reminderController.js');

const router = express.Router();

router.get('/', reminderController.getAllItemsEndpoint);
router.get('/excel', reminderController.getAllItemsExcelEndpoint);
router.get('/filters/all', reminderController.getAllFilters)
router.patch('/update', reminderController.updateExpectedReturnDate);

module.exports = router;

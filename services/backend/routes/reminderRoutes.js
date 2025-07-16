const express = require('express');
const reminderController = require('../controllers/reminderController.js');

const router = express.Router();

router.get('/', reminderController.getAllRemindersEndpoint);
router.get('/excel', reminderController.getAllRemindersExcelEndpoint);
router.get('/filters/all', reminderController.getAllFilters)
router.patch('/update', reminderController.updateExpectedReturnDate);

module.exports = router;

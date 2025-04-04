const express = require('express');
const dashboardController = require('../controllers/dashboardController.js');

const router = express.Router();

router.get('/', dashboardController.dashboard);
router.get('/reminders', dashboardController.getScheduledReturns);
router.patch('/reminders/update', dashboardController.updateExpectedReturnDate);

// router.post('/filters', homeController.getFilters);
// router.post('/show/:id', assetController.showAsset);

module.exports = router;

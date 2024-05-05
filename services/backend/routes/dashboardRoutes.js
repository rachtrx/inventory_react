const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/', dashboardController.dashboard);
// router.post('/filters', homeController.getFilters);
// router.post('/show/:id', assetController.showAsset);

module.exports = router;

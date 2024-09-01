const express = require('express');
const dashboardController = require('../controllers/dashboardController.js');

const router = express.Router();

router.get('/', dashboardController.dashboard);
// router.post('/filters', homeController.getFilters);
// router.post('/show/:id', assetController.showAsset);

module.exports = router;

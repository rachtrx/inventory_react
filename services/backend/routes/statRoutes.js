const express = require('express');
const statController = require('../controllers/statController.js');

const router = express.Router();

router.get('/', statController.dashboard);

// router.post('/filters', homeController.getFilters);
// router.post('/show/:id', assetController.showAsset);

module.exports = router;

const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.post('/variants', searchController.searchVariants);
router.post('/user', searchController.searchUser);

module.exports = router;

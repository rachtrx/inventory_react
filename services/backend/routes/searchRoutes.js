const express = require('express');
const searchController = require('../controllers/searchController.js');

const router = express.Router();

router.post('/variants', searchController.searchVariants);
router.post('/user', searchController.searchUser);

module.exports = router;

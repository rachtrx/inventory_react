const express = require('express');
const historyController = require('../controllers/events/historyController');

const router = express.Router();

router.get('/', historyController.getAllEvents);

module.exports = router;


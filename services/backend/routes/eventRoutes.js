const express = require('express');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.get('/', eventController.getAllEvents);
router.get('/filters/all', eventController.getAllFilters)
router.post('/add/remark', eventController.addRemark)
router.post('/filters', eventController.getFilters)
router.post('/update', eventController.updateEvent)

module.exports = router;


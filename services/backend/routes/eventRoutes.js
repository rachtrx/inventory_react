const express = require('express');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.get('/', eventController.getAllEventsEndpoint);
router.get('/excel', eventController.getAllEventsExcelEndpoint);
router.get('/filters/all', eventController.getAllFilters)
router.post('/add/remark', eventController.addRemark)
router.post('/filters', eventController.getFilters)
router.post('/update', eventController.updateEvent)
router.get('/signature/:filepath', eventController.getSignature)

module.exports = router;


const express = require('express');
const eventController = require('@controllers/events/eventController');

const router = express.Router();

router.get('/', eventController.getAllItemsEndpoint);
router.get('/excel', eventController.getAllItemsExcelEndpoint);
router.get('/filters/all', eventController.getAllFilters)
router.post('/add/remark', eventController.addRemark)
router.post('/update', eventController.updateEvent)
router.get('/signature/:filepath', eventController.getSignature)

module.exports = router;

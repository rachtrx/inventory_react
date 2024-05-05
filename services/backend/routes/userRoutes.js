const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.post('/filters', userController.getFilters);
router.post('/bookmark/:id', userController.bookmarkUser);
router.patch("/show/:id", userController.showUser);

module.exports = router;
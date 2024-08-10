const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.getUsers);
router.post('/filters', userController.getFilters)
router.get("/:id", userController.getUser);
router.post('/bookmark', userController.bookmarkUser);
router.post('/search', userController.searchUsers);

module.exports = router;
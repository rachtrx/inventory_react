const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.get("/:id", userController.showUser);
router.post('/bookmark', userController.bookmarkUser);
router.post('/search', userController.searchUsers);

module.exports = router;
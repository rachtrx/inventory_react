const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.get("/:id", userController.showUser);
router.post('/bookmark/:id', userController.bookmarkUser);

module.exports = router;
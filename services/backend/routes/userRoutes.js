const express = require('express');
const userController = require('../controllers/userController.js');

const router = express.Router();

router.post('/', userController.getUsers);
router.post('/filters', userController.getFilters)
router.get("/:id", userController.getUser);
router.patch('/update', userController.updateUser);
router.post('/search', userController.searchUsers);

module.exports = router;
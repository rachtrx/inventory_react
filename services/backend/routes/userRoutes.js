const express = require('express');
const userController = require('../controllers/userController.js');

const router = express.Router();

router.get('/', userController.getUsers);
router.post('/filters', userController.getFilters)
router.get("/:id", userController.getUser);
router.patch('/update', userController.updateUser);

module.exports = router;
const express = require('express');
const userController = require('../controllers/users/userController');


const router = express.Router();

router.post('/', userController.getUsers);
router.post('/filters', userController.getFilters)
router.get("/:id", userController.getUser);
router.patch('/update', userController.updateUser);

module.exports = router;
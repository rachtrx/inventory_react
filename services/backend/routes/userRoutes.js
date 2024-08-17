const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

<<<<<<< HEAD
router.post('/', userController.getUsers);
router.post('/filters', userController.getFilters)
=======
router.get('/', userController.getUsers);
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
router.get("/:id", userController.getUser);
router.post('/bookmark', userController.bookmarkUser);
router.post('/search', userController.searchUsers);

module.exports = router;
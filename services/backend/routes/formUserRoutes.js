const express = require('express');
const router = express.Router();
const formUserController = require('../controllers/formUserController');

router.get('/depts', formUserController.getDepts);
router.post('/create', formUserController.createUser); // create a variant

// router.patch("/update/:id", formUserController.updateUser);  
router.delete("/:id/delete", formUserController.deleteUser);

module.exports = router;

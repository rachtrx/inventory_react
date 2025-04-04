const express = require('express');
const userController = require('../controllers/userController.js');
const formUserController = require('../controllers/formUserController.js');
const formUserTagController = require('../controllers/formUserTagController.js');

const router = express.Router();

router.get('/', userController.getUsers);
router.patch('/update', userController.updateUser);
router.get('/filters/all', userController.getAllFilters);
router.post('/filters', userController.getFilters)
router.get("/:id", userController.getUser);

router.post('/add/dept', formUserController.createNewDept); // TODO
router.post('/add/user', formUserController.add);

router.get('/del/user', formUserController.loadUsrDel);
router.post('/del/user', formUserController.del);

router.post('/add/tag', formUserTagController.createNewTag);

router.get('/tag/user', formUserTagController.loadAddUsers);
router.get('/untag/user', formUserTagController.loadDelUsers);

router.post('/tag/user', formUserTagController.addUserTag)
router.post('/untag/user', formUserTagController.delUserTag)

module.exports = router;
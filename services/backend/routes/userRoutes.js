const express = require('express');
const userController = require('@controllers/users/userController.js');
const formUserController = require('@controllers/users/formUserController.js');
const formUserTagController = require('@controllers/users/formUserTagController.js');

const router = express.Router();

router.get('/', userController.getAllItemsEndpoint);
router.get('/excel', userController.getAllItemsExcelEndpoint);
router.patch('/update', userController.updateUser);
router.get('/filters/all', userController.getAllFilters);
router.post('/filters', userController.getFilters)
router.get("/:id", userController.getUser);

router.post('/add/dept', formUserController.createNewDept);
router.post('/add/user', formUserController.add);

router.post('/del/user/lookup', formUserController.loadUsrDel); // TODO
router.post('/del/user', formUserController.del);

router.post('/add/tag', formUserTagController.createNewTag);

router.post('/tag/user/lookup', formUserTagController.loadAddUsers); // TODO
router.post('/untag/user/lookup', formUserTagController.loadDelUsers); // TODO

router.post('/tag/user', formUserTagController.addUserTag)
router.post('/untag/user', formUserTagController.delUserTag)

module.exports = router;
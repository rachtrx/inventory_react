const express = require('express');
const multer = require('multer');
const path = require('path');

const loanController = require('../controllers/loans/loanController.js');
const returnController = require('../controllers/returns/returnController.js');

const eventController = require('../controllers/events/eventController.js');

const delAssetController = require('../controllers/assets/delAssetController.js');
const addAssetController = require('../controllers/assets/addAssetController.js');

const addUserController = require('../controllers/users/addUserController.js');
const delUserController = require('../controllers/users/delUserController.js');
const addAccessoryController = require('../controllers/accessories/addAccessoryController.js');
const addAssetTagController = require('../controllers/assets/addAssetTagController.js');
const delAssetTagController = require('../controllers/assets/delAssetTagController.js');
const addUserTagController = require('../controllers/users/addUserTagController.js');
const delUserTagController = require('../controllers/users/delUserTagController.js');

const router = express.Router();

const uploadPath = process.env.UPLOADS_FOLDER;

// const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//       cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
//     }
//   }),
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === 'application/pdf') {
//       cb(null, true);
//     } else {
//       cb(new Error('Only PDF files are allowed!'), false);
//     }
//   },
//   limits: {
//     fileSize: 1024 * 1024 * 5 // Limit of 5MB
//   }
// });

router.post('/add/asset', addAssetController.add);
router.post('/add/asset/schedule', addAssetController.scheduleAdd); 

router.get('/del/asset', delAssetController.loadAstDel);
router.post('/del/asset', delAssetController.del);
router.post('/del/asset/schedule', delAssetController.scheduleDel);

router.post('/add/accessory', addAccessoryController.add);
router.post('/add/accessory/schedule', addAccessoryController.scheduleAdd);

router.post('/loan', loanController.loan);
router.post('/loan/schedule', loanController.scheduleLoan);
// router.post('/loan/confirm', loanController.confirm);
// router.post('/loan/cancel', loanController.cancel);
router.get('/loan/asset', loanController.loadAstLoan);
router.get('/loan/user', loanController.loadUsrLoan);
router.get('/loan/accessory', loanController.loadAccLoan); //

router.post('/return', returnController.return_);
router.post('/return/schedule', returnController.scheduleReturn);
// router.post('/return/confirm', returnController.confirm);
// router.post('/return/cancel', returnController.cancel);
router.get('/return/accessory', returnController.loadAccReturn);
router.get('/return/asset', returnController.loadAstReturn);
router.get('/return/user', returnController.loadUserReturn);
router.get('/return', returnController.loadReturn);

router.post('/add/user', addUserController.add); 
router.post('/add/user/schedule', addUserController.scheduleAdd); 
// router.post('/add/user/confirm', addUserController.confirm);
// router.post('/add/user/cancel', addUserController.cancel);

router.get('/del/user', delUserController.searchUsersDelete);
router.post('/del/user', delUserController.del); // TODO loadUsrDel?
router.post('/del/user/schedule', delUserController.scheduleDel);
// router.post('/del/user/confirm', delUserController.confirm);
// router.post('/del/user/cancel', delUserController.cancel);

router.get('/tag/asset', addAssetTagController.loadAddAssets)
router.post('/tag/asset', addAssetTagController.addAssetTag)
router.post('/tag/asset/schedule', addAssetTagController.scheduleAddAssetTag)
// router.post('/tag/asset/confirm', addAssetTagController.confirm);
// router.post('/tag/asset/cancel', addAssetTagController.cancel);

router.get('/untag/asset', delAssetTagController.loadDelAssets)
router.post('/untag/asset', delAssetTagController.delAssetTag)
router.post('/untag/asset/schedule', delAssetTagController.scheduleDelAssetTag)
// router.post('/untag/asset/confirm', delAssetTagController.confirm);
// router.post('/untag/asset/cancel', delAssetTagController.cancel);

router.get('/tag/user', addUserTagController.loadAddUsers)
router.post('/tag/user', addUserTagController.addUserTag)
router.post('/tag/user/schedule', addUserTagController.scheduleAddUserTag)
// router.post('/tag/user/confirm', addUserTagController.confirm);
// router.post('/tag/user/cancel', addUserTagController.cancel);

router.get('/untag/user', delUserTagController.loadDelUsers)
router.post('/untag/user', delUserTagController.delUserTag)
router.post('/untag/user/schedule', delUserTagController.scheduleDelUsrTag)
// router.post('/untag/user/confirm', delUserTagController.confirm);
// router.post('/untag/user/cancel', delUserTagController.cancel);

router.post('/add/remark', eventController.addRemark)

// router.post('/download', formLoanReturnController.downloadEvent);

module.exports = router;

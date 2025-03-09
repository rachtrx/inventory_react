const express = require('express');
const formLoanReturnController = require('../controllers/formLoanReturnController.js');
const formAssetController = require('../controllers/formAssetController.js');
const formUserController = require('../controllers/formUserController.js');
const multer = require('multer');
const path = require('path');
const formAssetTagController = require('../controllers/formAssetTagController.js');
const formUserTagController = require('../controllers/formUserTagController.js');

const eventController = require('../controllers/eventController.js');

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

router.post('/loan', formLoanReturnController.loan);
router.get('/return', formLoanReturnController.loadReturn);

router.get('/return/asset', formLoanReturnController.loadAstReturn);
router.get('/return/user', formLoanReturnController.loadUserReturn);
router.get('/return/accessory', formLoanReturnController.loadAccReturn);

router.get('/loan/asset', formLoanReturnController.loadAstLoan);
router.get('/loan/user', formLoanReturnController.loadUsrLoan);
router.get('/loan/accessory', formLoanReturnController.loadAccLoan); //

router.get('/return', formLoanReturnController.loadReturn);
router.post('/return', formLoanReturnController.return);

router.post('/add/asset', formAssetController.add);

router.get('/del/asset', formAssetController.loadAstDel);
router.post('/del/asset', formAssetController.del);

router.post('/add/user', formUserController.add);

router.get('/del/user', formUserController.loadUsrDel)
router.post('/del/user', formUserController.del)

router.get('/tag/asset', formAssetTagController.loadAddAssets)
router.get('/untag/asset', formAssetTagController.loadDelAssets)

router.post('/tag/asset', formAssetTagController.addAssetTag)
router.post('/untag/asset', formAssetTagController.delAssetTag)

router.get('/tag/user', formUserTagController.loadAddUsers)
router.get('/untag/user', formUserTagController.loadDelUsers)

router.post('/tag/user', formUserTagController.addUserTag)
router.post('/untag/user', formUserTagController.delUserTag)

router.post('/download', formLoanReturnController.downloadEvent);

module.exports = router;

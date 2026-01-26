const express = require('express');
const loanController = require('@controllers/loans/loanController.js');
// const multer = require('multer');
// const path = require('path');

const accLoanController = require('@controllers/loans/accLoanController.js');
const astLoanController = require('@controllers/loans/astLoanController.js');
const usrLoanController = require('@controllers/loans/usrLoanController.js');

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

router.post('/loan', loanController.loan);

router.post('/return/asset/lookup', astLoanController.loadAstReturn); // TODO
router.get('/return/user', usrLoanController.loadUsrReturn);
router.get('/return/accessory', accLoanController.loadAccReturn);

router.post('/loan/asset/lookup', astLoanController.loadAstLoan); // TODO
router.get('/loan/asset/:astSTypeId', astLoanController.loadSuggestedAccLoan);
router.post('/loan/user/lookup', usrLoanController.loadUsrLoan); // TODO
router.get('/loan/accessory', accLoanController.loadAccLoan);

router.post('/return/lookup', loanController.loadReturn); // TODO
router.post('/return', loanController.return);

router.post('/download', loanController.downloadEvent);

module.exports = router;

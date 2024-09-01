const express = require('express');
const formLoanReturnController = require('../controllers/formLoanReturnController.js');
const formAssetController = require('../controllers/formAssetController.js');
const formUserController = require('../controllers/formUserController.js');
const multer = require('multer');
const path = require('path');

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

router.use('/loan', formLoanReturnController.loan);
router.use('/return', formLoanReturnController.return);

router.use('/addAsset', formAssetController.add);
router.use('/condemnAsset', formAssetController.condemn);

router.use('/addUser', formUserController.add);
router.use('/removeUser', formUserController.remove)

// router.post('/loan', upload.single('pdfFile'), formLoanReturnController.loan);
// router.post('/return', upload.single('pdfFile'), formLoanReturnController.return);

router.post('/download', formLoanReturnController.downloadEvent);

module.exports = router;

const express = require('express');
const router = express.Router();
const formAssetRoutes = require('./formAssetRoutes')
const formUserRoutes = require('./formUserRoutes')

const formLoanReturnController = require('../controllers/formLoanReturnController');
const multer = require('multer');
const path = require('path');
const uploadPath = process.env.UPLOADS_FOLDER;

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5 // Limit of 5MB
  }
});

router.use('/assets', formAssetRoutes);
router.use('/users', formUserRoutes);

router.post('/loan', upload.single('pdfFile'), formLoanReturnController.loan);
router.post('/return', upload.single('pdfFile'), formLoanReturnController.return);

router.post('/download', formLoanReturnController.downloadEvent);

module.exports = router;

const express = require('express');
const authController = require('../controllers/authController.js');

const router = express.Router();

router.post("/login-sso", authController.loginSSO);
router.post("/chgpw", authController.chgPw);
router.post("/register", authController.register);
router.post("/login", authController.login);

// This middleware checks if the JWT is valid, and if so, it decodes it and makes the payload available on req.auth. IMPT

router.get('/checkAuth', authController.checkAuth)

router.post('/logout', authController.logout);

module.exports = router;
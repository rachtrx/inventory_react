const express = require('express');
const authController = require('@controllers/admin/authController.js');
const router = express.Router();

// router.post("/login-sso", authController.loginSSO);
router.post("/chgpw", authController.chgPw);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);

// Step 1: Redirect User to Microsoft Login
router.get("/microsoft", authController.redirectMsftAuth);
// Step 2: Microsoft Redirects to Backend
router.get("/microsoft/callback", authController.loginMsft);

// This middleware checks if the JWT is valid, and if so, it decodes it and makes the payload available on req.auth. IMPT

router.get('/checkAuth', authController.checkAuth)

router.post('/logout', authController.logout);

module.exports = router;
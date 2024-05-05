const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController.js");
const { expressjwt: jwt } = require('express-jwt');

router.post("/register", authController.register);

router.post("/login", authController.login);

// This middleware checks if the JWT is valid, and if so, it decodes it and makes the payload available on req.auth. IMPT

router.get('/checkAuth', authController.checkAuth)

router.post('/logout', authController.logout);

module.exports = router;
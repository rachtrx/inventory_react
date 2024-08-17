const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController.js");
<<<<<<< HEAD

router.post("/login-sso", authController.loginSSO);
router.post("/chgpw", authController.chgPw);
router.post("/register", authController.register);
=======
const { expressjwt: jwt } = require('express-jwt');

router.post("/register", authController.register);

>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
router.post("/login", authController.login);

// This middleware checks if the JWT is valid, and if so, it decodes it and makes the payload available on req.auth. IMPT

router.get('/checkAuth', authController.checkAuth)

router.post('/logout', authController.logout);

module.exports = router;
const bcrypt = require('bcryptjs');
const logger = require('../logging.js');
const { Admin } = require('../models');
const { generateToken, generatePKCE } = require('../utils/jwtHelper.js');
const axios = require('axios');

const createAdminObject = (admin) => ({
    adminName: admin.adminName,
    email: admin.email,
    displayName: admin.displayName,
    authType: admin.authType,
    canSetupPassword: !admin.authType.includes('local')
})
class AuthController {

  /*
  * https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow
  * Redirects the user to the Microsoft to /authorize to authenticate
  */
  async redirectMsftAuth(req, res) {
    const { codeVerifier, codeChallenge } = generatePKCE();
  
    // Store codeVerifier securely in a HttpOnly cookie
    res.cookie("code_verifier", codeVerifier, {
      httpOnly: true, secure: true, sameSite: "Lax"
    });
  
    const authUrl = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize?client_id=${process.env.AZURE_CLIENT_ID}&response_type=code&redirect_uri=${process.env.AZURE_CALLBACK_URL}&response_mode=query&scope=openid email profile&state=12345&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  
    res.redirect(authUrl);
  }

  /*
  * https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow
  * Authenticates the user at /token and creates a JWT token
  */
  async loginMsft(req, res) {
    
    const code = req.query.code;
    const codeVerifier = req.cookies?.code_verifier;

    if (!code || !codeVerifier) {
        return res.status(400).send("Authorization code or code verifier missing");
    }

    try {
        // Exchange code for access token with PKCE
        const tokenResponse = await axios.post(
        `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
            new URLSearchParams({
                client_id: process.env.AZURE_CLIENT_ID,
                scope: "openid email profile",
                code,
                redirect_uri: process.env.AZURE_CALLBACK_URL,
                grant_type: "authorization_code",
                code_verifier: codeVerifier, // PKCE proof
                client_secret: process.env.AZURE_CLIENT_SECRET
            })
        );

        const { access_token } = tokenResponse.data;
        console.log(access_token);

        // Fetch user profile from Microsoft Graph
        const profileResponse = await axios.get("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${access_token}` },
        });

        const profile = profileResponse.data;

        // Authenticate user in database
        let admin = await Admin.findOne({ where: { id: profile.id } });

        if (!admin) {
        admin = await Admin.create({
            id: profile.id,
            email: profile.mail,
            adminName: profile.displayName,
            authType: ["SSO"],
        });
        }

        const jwtToken = generateToken(admin); // Generate JWT for frontend

        res.cookie("INVENTORY", jwtToken, {
            httpOnly: true, secure: true, sameSite: 'strict'
        });

        if (admin.pwd) return res.redirect(`${process.env.FRONTEND_URL}/dashboard`); // Redirect user to frontend
        return res.redirect(`${process.env.FRONTEND_URL}/profile`);
      } catch (error) {
      logger.error("OAuth Login Error:", error);
      return res.status(500).send("Authentication failed");
    }
  }

  async login (req, res) {
    const { email, password } = req.body;
  
    try {
      const admin = await Admin.findOne({ where: { email } });
      if (!admin) {
        return res.status(404).json({ error: "Usr not found" });
      }
  
      if (admin.authType.includes('local') && bcrypt.compareSync(password, admin.pwd)) {
        const token = generateToken(admin);
        res.cookie('INVENTORY', token, { httpOnly: true, secure: true, sameSite: 'strict' });
        return res.json(createAdminObject(admin)); // Redirect user to frontend
      } else if (admin.authType.includes('SSO')) {
        return res.status(401).json({ error: "SSO login required" });
      } else {
        return res.status(401).json({ error: "Invalid credentials or login method" });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).send({ error: error.message });
    }
  };
  
  async checkAuth(req, res) {
    
    try {
      const admin = await Admin.findOne({ where: { id: req.auth.id } });
      if (admin) {
        return res.json(createAdminObject(admin));
      } else {
        return res.status(404).json({ message: "Admin not found" });
      }
    } catch (error) {
      console.error('Check auth error:', error);
      res.status(500).json({ error: error.message, error: error.message });
    }
  };
  
  async register (req, res) {
    const { adminName, email, password } = req.body;
  
    try {
      // Hash password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
  
      // Create user
      const newUser = await Admin.create({
        adminName,
        email,
        pwd: hashedPassword,
        authType: ['local']
      });
  
      res.status(201).json({ message: "Usr created successfully", userId: newUser.id });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(409).send({error: 'Usr with this email already exists.'});
      } else {
        res.status(500).send({ error: error.message });
      }
    }
  };
  
  async chgPw (req, res) {
    const { password } = req.body;
  
    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      logger.info(req.auth)
  
      const admin = await Admin.findOne({ where: { id: req.auth.id } });
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }
  
      admin.pwd = hashedPassword;
      if (!admin.authType.includes('local')) {
        admin.authType.push('local');
        admin.changed('authType', true);
      }
  
      await admin.save();
  
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  
  async logout (req, res) {
    res.clearCookie('INVENTORY');
    res.json({ msg: 'Logout successful' });
  }
}

module.exports = new AuthController();
const bcrypt = require('bcryptjs');
const { Admin } = require('@models/index.js');
const { generateToken, generatePKCE, generateRefreshToken } = require('@utils/validation.js');
const axios = require('axios');
const { MIN_15, DAYS_30 } = require('@utils/constants.js');
const jwt = require('jsonwebtoken');

const createAdminObject = (admin) => ({
    adminName: admin.adminName,
    email: admin.email,
    displayName: admin.displayName,
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

      const { id_token, access_token } = tokenResponse.data;

      const decoded = jwt.decode(id_token);

      const inGroup = decoded.groups?.includes(process.env.SECURITY_GROUP_ID); 
      if (!inGroup) {
        return res.status(403).send("Access denied: not in required security group");
      }

      // Authenticate user in database
      let admin = await Admin.findOne({ where: { id: decoded.oid } });

      if (!admin) {
        admin = await Admin.create({
            id: decoded.oid,
            email: decoded.email,
            adminName: decoded.name,
        });
      }

      const jwtToken = generateToken(admin); // Generate JWT for frontend
      const refreshToken = generateRefreshToken(admin);

      res.cookie("INVENTORY", jwtToken, {
          httpOnly: true, secure: true, sameSite: 'strict', maxAge: MIN_15
      });

      res.cookie("INVENTORY_REFRESH", refreshToken, {
          httpOnly: true, secure: true, sameSite: 'strict', maxAge: DAYS_30
      });

      return res.redirect(`${process.env.FRONTEND_URL}/reminders`); // Redirect user to frontend
    } catch (error) {
      logger.error("OAuth Login Error:", error);
      return res.status(500).send("Authentication failed");
    }
  }
  
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

  refresh = async (req, res) => {
    // Get the refresh token from cookies
    const refreshToken = req.cookies.INVENTORY_REFRESH;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }
  
    // Verify the refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired refresh token' });
      }
  
      // Optionally check if the refresh token is still valid in database
      // TODO For enhanced security, store refresh tokens in a db and verify the token exists for the user
  
      // Generate a new access token
      const newAccessToken = generateToken({ id: decoded.id });
      res.cookie("INVENTORY", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: MIN_15
      });
  
      return res.json({ message: 'Access token refreshed' });
    });
  };
  
  async logout (req, res) {
    res.clearCookie('INVENTORY');
    res.clearCookie('INVENTORY_REFRESH');
    res.json({ msg: 'Logout successful' });
  }
}

module.exports = new AuthController();
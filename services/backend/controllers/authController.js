const bcrypt = require('bcrypt');
const logger = require('../logging.js');
const { sequelize, Usr, Admin } = require('../models/postgres');
const { generateToken } = require('../utils/jwtHelper.js');

const createAdminObject = (admin) => ({
    adminName: admin.adminName,
    email: admin.email,
    displayName: admin.displayName,
    authType: admin.authType,
    canSetupPassword: !admin.authType.includes('local')
})

class AuthController {

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
        return res.json(createAdminObject(admin));
      } else if (admin.authType.includes('SSO')) {
        return res.status(401).json({ error: "SSO login required" });
      } else {
        return res.status(401).json({ error: "Invalid credentials or login method" });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  async loginSSO (req, res, done) {
    try {
      const profile = req.body.profile;
  
      // Search for an existing admin using the OID from the profile
      let admin = await Admin.findOne({ where: { id: profile.id } });

      logger.info(admin);
  
      if (!admin) {
        // If admin does not exist, create a new record
        admin = await Admin.create({
          id: profile.id,
          email: profile.mail,
          adminName: profile.displayName,
          authType: ['SSO']
        });
      } else if (!admin.authType.includes('SSO')) {
        admin.authType.push('SSO');  // Add 'SSO' to authType array
        await admin.save();  // Save the updated admin instance to the database
      }
  
      const token = generateToken(admin);
  
      res.cookie('INVENTORY', token, {
        httpOnly: true,
        // secure: true, // Recommended to use secure in production.
        sameSite: 'strict' // This setting can help protect against CSRF attacks
      });
  
      return res.json(createAdminObject(admin));
  
    } catch (error) {
      console.error('SSO login error:', error);
      return done(error);  // Properly pass the error through the callback
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
      res.status(500).json({ message: "Internal Server Error", error: error.message });
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
        res.status(409).send('Usr with this email already exists.');
      } else {
        res.status(500).send('Internal Server Error');
      }
    }
  };
  
  async chgPw (req, res) {
    const { newPw } = req.body;
  
    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPw, salt);
  
      const admin = await Admin.findOne({ where: { id: req.auth.id } });
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
  
      admin.pwd = hashedPassword;
      if (!admin.authType.includes('local')) {
        admin.authType.push('local');
      }
  
      await admin.save();
  
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  
  
  logout (req, res) {
    res.clearCookie('INVENTORY');
    res.json({ msg: 'Logout successful' });
  }
}

module.exports = new AuthController();
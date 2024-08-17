<<<<<<< HEAD
const bcrypt = require('bcrypt');
const logger = require('../logging')
const { sequelize, User } = require('../models/postgres');
const Admin = require('../models/mongo/Admin')
// const uuid = require('uuid');
const { generateToken } = require('../utils/jwtHelper');

const createAdminObject = (admin) => ({
    adminName: admin.adminName,
    email: admin.email,
    displayName: admin.displayName,
    authType: admin.authType,
    canSetupPassword: !admin.authType.includes('local')
})

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ error: "User not found" });
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
=======
const db = require("../models/postgres");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../logging')
const { sequelize, Admin, User } = require('../models/postgres');
const uuid = require('uuid');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Admin.findOne({ where: { email } });
    if (user && bcrypt.compareSync(password, user.pwd)) {
      const token = jwt.sign(
        { id: user.id }, // Only include the user ID. # TODO include role in future
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Set the JWT in an HttpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        // secure: true, // Use secure: true in production with HTTPS
        sameSite: 'strict' // This setting can help protect against CSRF attacks
      });

      res.json({ userName:user.adminName });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    logger.error('Sign in error:', error);
    console.error('Sign in error:', error);
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
    res.status(500).send('Internal Server Error');
  }
};

<<<<<<< HEAD
exports.loginSSO = async (req, res, done) => {
  try {
    const profile = req.body.profile;

    // Search for an existing admin using the OID from the profile
    let admin = await Admin.findOne({ _id: profile.id });

    console.log(profile);

    if (!admin) {
      admin = new Admin({
        _id: profile.id,
        email: profile.mail,
        adminName: profile.displayName,
        authType: ['SSO'] 
      });
      await admin.save();
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
}

exports.checkAuth = async (req, res) => {
  try {
		const admin = await Admin.findOne({ _id: req.auth.id });
		if (admin) {
			return res.json(createAdminObject(admin));
		} else {
			return res.status(404).json({ message: "Admin not found" });
=======
exports.checkAuth = async (req, res) => {
  try {
		console.log(req.auth);
		const user = await Admin.findByPk(req.auth.id); // Accessing user id set in JWT
		if (user) {
			res.json({ userName:user.adminName });
		} else {
			res.status(401).json({ userName: null });
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
		}
  } catch (error) {
		console.error('Check auth error:', error);
		logger.error('Check auth error:', error);
<<<<<<< HEAD
		res.status(500).json({ message: "Internal Server Error", error: error.message });
=======
		res.status(500).send('Internal Server Error');
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
  }
};

exports.register = async (req, res) => {
  const { adminName, email, password } = req.body;

  try {
      // Hash password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create user
      const newUser = await Admin.create({
<<<<<<< HEAD
          adminName,
=======
					id: uuid.v4(),
					adminName,
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
          email,
          pwd: hashedPassword
      });

      res.status(201).json({ message: "User created successfully", userId: newUser.id });
  } catch (error) {
      console.error('Registration error:', error);
<<<<<<< HEAD
      logger.error('Registration error:', error);
      if (error.name === 'MongoError' && error.code === 11000) {
=======
			logger.error('Registration error:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
          res.status(409).send('User with this email already exists.');
      } else {
          res.status(500).send('Internal Server Error');
      }
  }
};

<<<<<<< HEAD
exports.chgPw = async (req, res) => {
  const { newPw } = req.body;

  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPw, salt);

    const admin = await Admin.findOne({ _id: req.auth.id });
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

exports.logout = (req, res) => {
  res.clearCookie('INVENTORY');
=======
exports.logout = (req, res) => {
  res.clearCookie('token');
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
  res.json({ msg: 'Logout successful' });
}
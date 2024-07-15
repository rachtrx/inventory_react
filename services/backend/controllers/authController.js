const db = require("../models");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../logging')
const { sequelize, Admin, User } = require('../models');
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
    res.status(500).send('Internal Server Error');
  }
};

exports.checkAuth = async (req, res) => {
  try {
		console.log(req.auth);
		const user = await Admin.findByPk(req.auth.id); // Accessing user id set in JWT
		if (user) {
			res.json({ userName:user.adminName });
		} else {
			res.status(401).json({ userName: null });
		}
  } catch (error) {
		console.error('Check auth error:', error);
		logger.error('Check auth error:', error);
		res.status(500).send('Internal Server Error');
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
					id: uuid.v4(),
					adminName,
          email,
          pwd: hashedPassword
      });

      res.status(201).json({ message: "User created successfully", userId: newUser.id });
  } catch (error) {
      console.error('Registration error:', error);
			logger.error('Registration error:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
          res.status(409).send('User with this email already exists.');
      } else {
          res.status(500).send('Internal Server Error');
      }
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ msg: 'Logout successful' });
}
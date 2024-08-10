const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email }, // Include any necessary claims
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};
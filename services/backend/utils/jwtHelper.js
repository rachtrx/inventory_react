const jwt = require('jsonwebtoken');
const crypto = require("crypto");

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email }, // Include any necessary claims
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id },
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: '30d' }
  );
}

const generatePKCE = () => {
    const codeVerifier = crypto.randomBytes(64).toString("hex");
    const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
    return { codeVerifier, codeChallenge };
};

module.exports = { generateToken, generateRefreshToken, generatePKCE }
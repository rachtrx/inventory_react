const crypto = require('crypto');

const generateSecureID = () => {
	// Generates 8 hexadecimal characters
	return crypto.randomBytes(4).toString('hex').toUpperCase(); 
};

const isValidID = (id) => {
	const idPattern = /^[A-F0-9]{8}$/;
	return idPattern.test(id);
};

module.exports = { generateSecureID, isValidID }
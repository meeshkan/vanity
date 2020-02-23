const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const generateToken = data => jwt.sign(data, JWT_SECRET, { expiresIn: '7d' });
const verifyToken = token => jwt.verify(token, JWT_SECRET);

module.exports = {
	generateToken,
	verifyToken,
};

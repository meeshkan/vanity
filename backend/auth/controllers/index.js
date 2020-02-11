const jwt = require('jsonwebtoken');
const passport = require('../passport');
const { JWT_SECRET } = require('../../config');

const generateToken = data => jwt.sign(data, JWT_SECRET, { expiresIn: '7d' });
const verifyToken = token => jwt.verify(token, JWT_SECRET);

const login = (req, res, next) => {
	passport.authenticate('github', {
		failureRedirect: '/login',
	})(req, res, next);
};

const setCookies = (req, res) => {
	const { id, username, avatar } = req.user;
	const user = { id, username, avatar };
	const token = generateToken(user);
	res
		.cookie('github-user', JSON.stringify(user))
		.cookie('jwt', token)
		.redirect('/preferences');
};

const sendUserData = async (req, res) => {
	try {
		const token = req.cookies.jwt;
		const user = await verifyToken(token);
		res.status(200).send(user);
	} catch (error) {
		console.error(error); // TODO: handle error
		res.status(401).send();
	}
};

const logout = (req, res) => {
	req.logout();
	res.redirect('/login');
};

module.exports = {
	login,
	setCookies,
	sendUserData,
	logout,
};

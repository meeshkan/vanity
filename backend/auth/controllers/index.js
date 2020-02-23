const { generateToken, verifyToken } = require('../../utils/token');
const passport = require('../passport');

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
		res.status(401).send(error);
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

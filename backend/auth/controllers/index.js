const { OK, UNAUTHORIZED } = require('http-status');
const { UnauthorizedError } = require('../../utils/errors');
const { generateToken, verifyToken } = require('../../utils/token');
const { passport } = require('../passport');
const logger = require('../../utils/logger');

const login = (request, response, next) => {
	passport.authenticate('github', {
		failureRedirect: '/login',
	})(request, response, next);
};

const setCookies = (request, response) => {
	const { id, username, avatar } = request.user;
	const user = { id, username, avatar };
	const token = generateToken(user);
	response
		.cookie('github-user', JSON.stringify(user))
		.cookie('jwt', token)
		.redirect('/preferences');
};

const sendUserData = async (request, response) => {
	try {
		const token = request.cookies.jwt;
		const user = await verifyToken(token);
		response.status(OK).send(user);
	} catch (error) {
		logger.error(error);
		response.status(UNAUTHORIZED).send(UnauthorizedError);
	}
};

const logout = (request, response) => {
	request.logout();
	response.redirect('/login');
};

module.exports = {
	login,
	setCookies,
	sendUserData,
	logout,
};

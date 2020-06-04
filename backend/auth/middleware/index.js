const { UNAUTHORIZED } = require('http-status');
const { UnauthorizedError } = require('../../utils/errors');
const { User } = require('../../models');
const logger = require('../../utils/logger');

const isAdmin = async (request, response, next) => {
	try {
		const token = request.cookies.jwt;
		const user = await User.findByToken(token);
		if (user.admin) {
			return next();
		}

		response.status(UNAUTHORIZED).json(UnauthorizedError);
	} catch (error) {
		logger.error(error);
		response.status(UNAUTHORIZED).json(UnauthorizedError);
	}
};

module.exports = {
	isAdmin,
};

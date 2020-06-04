const { UNAUTHORIZED } = require('http-status');
const { UnauthorizedError } = require('../../utils/errors');
const { User } = require('../../models');
const logger = require('../../utils/logger');

const isAdmin = async (req, res, next) => {
	try {
		const token = req.cookies.jwt;
		const user = await User.findByToken(token);
		if (user.admin) {
			return next();
		}

		res.status(UNAUTHORIZED).json(UnauthorizedError);
	} catch (error) {
		logger.error(error);
		res.status(UNAUTHORIZED).json(UnauthorizedError);
	}
};

module.exports = {
	isAdmin,
};

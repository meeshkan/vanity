const { OK, UNAUTHORIZED } = require('http-status');
const { UnauthorizedError } = require('../../utils/errors');
const { verifyToken } = require('../../utils/token');
const { User } = require('../../models');

const isAdmin = async (req, res, next) => {
	try {
		const token = req.cookies.jwt;
		const userByToken = await verifyToken(token);
		const userByID = await User.findByPk(userByToken.id);
		const user = userByID.get({ plain: true });
		if (user.admin) {
			return next();
		}

		res.status(UNAUTHORIZED).json(UnauthorizedError);
	} catch (error) {
		res.status(UNAUTHORIZED).json(UnauthorizedError);
	}
};

module.exports = {
	isAdmin,
};

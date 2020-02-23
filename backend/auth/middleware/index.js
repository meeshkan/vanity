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

		res.status(401).json();
	} catch (error) {
		console.error(error); // TODO: handle error
		res.status(401).json();
	}
};

module.exports = {
	isAdmin,
};

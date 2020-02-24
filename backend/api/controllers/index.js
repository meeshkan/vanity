const { OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR } = require('http-status');
const { UnauthorizedError } = require('../../utils/errors');
const { verifyToken } = require('../../utils/token');
const { User } = require('../../models');

const preferences = async (req, res) => {
	try {
		const auth = req.headers.authorization;
		const { token } = JSON.parse(auth);
		const user = await verifyToken(token);
		const userByID = await User.findByPk(user.id);
		const { repos } = userByID.get({ plain: true });
		user.repos = repos;
		res.status(OK).send(user);
	} catch (error) {
		res
			.clearCookie('github-user')
			.clearCookie('jwt')
			.status(UNAUTHORIZED).json(UnauthorizedError);
	}
};

const updateRepos = async (req, res) => {
	try {
		const { repos } = req.body;
		const auth = req.headers.authorization;
		const { token } = JSON.parse(auth);
		const user = await verifyToken(token);
		User.update(
			{ repos },
			{
				where: {
					id: user.id,
				},
			}
		)
			.then(returned => res.status(OK).json({ res: returned }))
			.catch(error => res.status(INTERNAL_SERVER_ERROR).json(error));
	} catch (error) {
		res.status(INTERNAL_SERVER_ERROR).json(error);
	}
};

module.exports = {
	preferences,
	updateRepos,
};

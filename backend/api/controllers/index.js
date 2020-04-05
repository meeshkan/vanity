const { OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR } = require('http-status');
const { UnauthorizedError, UnsubscriptionError } = require('../../utils/errors');
const { verifyToken } = require('../../utils/token');
const { ingestMetrics, sendEmail } = require('../../workers/queues');
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
		res.status(UNAUTHORIZED).json(UnauthorizedError);
	}
};

const UnsubscriptionErrors = {
	MISMATCH: UnsubscriptionError('Email did not match token'),
	INVALID_TOKEN: UnsubscriptionError('Unsubscription token is invalid'),
	ALREADY_UNSUBSCRIBED: UnsubscriptionError('Email has already been unsubscribed')
};

const unsubscribe = async (req, res) => {
	try {
		const { token, email } = req.body;
		const { email: emailByToken, id } = await verifyToken(token);

		if (emailByToken !== email) {
			return res.status(UNAUTHORIZED).json(UnsubscriptionErrors.MISMATCH);
		}

		const ingestMetricsJobs = await ingestMetrics.getJobs(['delayed']);
		const sendEmailJobs = await sendEmail.getJobs(['delayed']);

		const jobsToDelete = [
			ingestMetricsJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id),
			sendEmailJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id)
		];

		if (jobsToDelete.every(job => !job)) {
			return res.status(UNAUTHORIZED).json(UnsubscriptionErrors.ALREADY_UNSUBSCRIBED);
		}

		jobsToDelete.forEach(async job => await job.remove());

		res.status(OK).json({ user: { email, id } });
	} catch (error) {
		res.status(UNAUTHORIZED).json(UnsubscriptionErrors.INVALID_TOKEN);
	}
};

module.exports = {
	preferences,
	updateRepos,
	unsubscribe,
};

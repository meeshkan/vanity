const { OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR } = require('http-status');
const { UnauthorizedError, UnsubscriptionError } = require('../../utils/errors');
const { verifyToken } = require('../../utils/token');
const { ingestMetrics, sendEmail } = require('../../workers/queues');
const { User } = require('../../models');
const { fetchUserInstallations } = require('../../utils/github');

const metricTypesRequiringInstallation = ['views', 'clones'];

const preferences = async (req, res) => {
	try {
		const auth = req.headers.authorization;
		const { token: jwt } = JSON.parse(auth);
		const user = await verifyToken(jwt);
		const userByID = await User.findByPk(user.id);
		const { repos, metricTypes, token: accessToken } = userByID.get({ plain: true });
		user.repos = repos;
		const installations = await fetchUserInstallations(accessToken);
		user.appInstalled = installations.total_count > 0;
		user.metricTypes = metricTypes.map(metricType => {
			if (metricTypesRequiringInstallation.includes(metricType.name)) {
				if (user.appInstalled) {
					metricType.disabled = false;
				} else {
					metricType.selected = false;
					metricType.disabled = true;
				}
			}

			return metricType;
		});

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
		try {
			const returned = await User.update(
				{ repos },
				{
					where: {
						id: user.id,
					},
				}
			);

			return res.status(OK).json({ res: returned });
		} catch (error) {
			return res.status(UNAUTHORIZED).json(error);
		}
	} catch (error) {
		res.status(UNAUTHORIZED).json(UnauthorizedError);
	}
};

const updateMetricTypes = async (req, res) => {
	try {
		const { metricTypes } = req.body;
		const auth = req.headers.authorization;
		const { token } = JSON.parse(auth);
		const user = await verifyToken(token);
		try {
			const returned = await User.update(
				{ metricTypes },
				{
					where: {
						id: user.id,
					},
				}
			);

			return res.status(OK).json({ res: returned });
		} catch (error) {
			return res.status(UNAUTHORIZED).json(error);
		}
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
	updateMetricTypes,
	unsubscribe,
};

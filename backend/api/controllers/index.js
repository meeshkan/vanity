const { OK, UNAUTHORIZED } = require('http-status');
const { UnauthorizedError, UnsubscriptionError } = require('../../utils/errors');
const { verifyToken } = require('../../utils/token');
const { ingestMetrics, sendEmail } = require('../../workers/queues');
const { User } = require('../../models');
const { fetchUserInstallations } = require('../../utils/github');

const METRIC_TYPES_REQUIRING_INSTALLATION = ['views', 'clones'];

const preferences = async (req, res) => {
	try {
		const auth = req.headers.authorization;
		const { token: jwt } = JSON.parse(auth);
		const user = await verifyToken(jwt);
		const userById = await User.findByPk(user.id);
		const { repos, metricTypes, token: accessToken } = userById;
		user.repos = repos;
		const installations = await fetchUserInstallations(accessToken);
		user.isAppInstalled = installations.total_count > 0;
		user.metricTypes = metricTypes.map(metricType => {
			if (METRIC_TYPES_REQUIRING_INSTALLATION.includes(metricType.name)) {
				if (user.isAppInstalled) {
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
		const user = await User.findByToken(token);
		user.repos = repos;
		await user.save({ fileds: ['repos'] });
		return res.status(OK).json({
			message: `Successfully updated repos for ${user.username}`
		});
	} catch (error) {
		res.status(UNAUTHORIZED).json(error);
	}
};

const updateMetricTypes = async (req, res) => {
	try {
		const { metricTypes } = req.body;
		const auth = req.headers.authorization;
		const { token } = JSON.parse(auth);
		const user = await User.findByToken(token);
		user.metricTypes = metricTypes;
		await user.save({ fields: ['metricTypes'] });
		return res.status(OK).json({
			message: `Successfully updated metric types for ${user.username}`
		});
	} catch (error) {
		res.status(UNAUTHORIZED).json(error);
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

		jobsToDelete.forEach(job => job.remove());

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

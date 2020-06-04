const { OK, UNAUTHORIZED } = require('http-status');
const { UnauthorizedError, UnsubscriptionError } = require('../../utils/errors');
const { verifyToken } = require('../../utils/token');
const { ingestMetrics, sendEmail } = require('../../workers/queues');
const { User } = require('../../models');
const { fetchUserInstallations } = require('../../utils/github');
const logger = require('../../utils/logger');

const METRIC_TYPES_REQUIRING_INSTALLATION = new Set(['views', 'clones']);

const preferences = async (request, response) => {
	try {
		const auth = request.headers.authorization;
		const { token: jwt } = JSON.parse(auth);
		const user = await verifyToken(jwt);
		const userById = await User.findByPk(user.id);
		const { repos, metricTypes, token: accessToken } = userById;
		user.repos = repos;
		const installations = await fetchUserInstallations(accessToken);
		user.isAppInstalled = installations.total_count > 0;
		user.metricTypes = metricTypes.map(metricType => {
			if (METRIC_TYPES_REQUIRING_INSTALLATION.has(metricType.name)) {
				if (user.isAppInstalled) {
					metricType.disabled = false;
				} else {
					metricType.selected = false;
					metricType.disabled = true;
				}
			}

			return metricType;
		});

		response.status(OK).send(user);
	} catch (error) {
		logger.error(error);
		response
			.clearCookie('github-user')
			.clearCookie('jwt')
			.status(UNAUTHORIZED).json(UnauthorizedError);
	}
};

const updateRepos = async (request, response) => {
	try {
		const { repos } = request.body;
		const auth = request.headers.authorization;
		const { token } = JSON.parse(auth);
		const user = await User.findByToken(token);
		user.repos = repos;
		await user.save({ fileds: ['repos'] });
		return response.status(OK).json({
			message: `Successfully updated repos for ${user.username}`
		});
	} catch (error) {
		logger.error(error);
		response.status(UNAUTHORIZED).json(error);
	}
};

const updateMetricTypes = async (request, response) => {
	try {
		const { metricTypes } = request.body;
		const auth = request.headers.authorization;
		const { token } = JSON.parse(auth);
		const user = await User.findByToken(token);
		user.metricTypes = metricTypes;
		await user.save({ fields: ['metricTypes'] });
		return response.status(OK).json({
			message: `Successfully updated metric types for ${user.username}`
		});
	} catch (error) {
		logger.error(error);
		response.status(UNAUTHORIZED).json(error);
	}
};

const UnsubscriptionErrors = {
	MISMATCH: UnsubscriptionError('Email did not match token'),
	INVALID_TOKEN: UnsubscriptionError('Unsubscription token is invalid'),
	ALREADY_UNSUBSCRIBED: UnsubscriptionError('Email has already been unsubscribed')
};

const unsubscribe = async (request, response) => {
	try {
		const { token, email } = request.body;
		const { email: emailByToken, id } = await verifyToken(token);

		if (emailByToken !== email) {
			return response.status(UNAUTHORIZED).json(UnsubscriptionErrors.MISMATCH);
		}

		const ingestMetricsJobs = await ingestMetrics.getJobs(['delayed']);
		const sendEmailJobs = await sendEmail.getJobs(['delayed']);

		const jobsToDelete = [
			ingestMetricsJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id),
			sendEmailJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id)
		];

		if (jobsToDelete.every(job => !job)) {
			return response.status(UNAUTHORIZED).json(UnsubscriptionErrors.ALREADY_UNSUBSCRIBED);
		}

		jobsToDelete.forEach(job => job.remove());

		response.status(OK).json({ user: { email, id } });
	} catch (error) {
		logger.error(error);
		response.status(UNAUTHORIZED).json(UnsubscriptionErrors.INVALID_TOKEN);
	}
};

module.exports = {
	preferences,
	updateRepos,
	updateMetricTypes,
	unsubscribe,
};

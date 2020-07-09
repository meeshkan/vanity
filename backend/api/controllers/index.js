const { OK, UNAUTHORIZED } = require('http-status');
const moment = require('moment');
const { verifyToken } = require('../../utils/token');
const { ingestMetrics, sendEmail } = require('../../workers/queues');
const { UserScheduler } = require('../../models/user-scheduler');
const { User } = require('../../models');
const { fetchUserInstallations } = require('../../utils/github');
const logger = require('../../utils/logger');
const {
	UnauthorizedError,
	UnsubscriptionError,
	ResubscriptionError,
} = require('../../utils/errors');

const METRIC_TYPES_REQUIRING_INSTALLATION = new Set(['views', 'clones']);

const getUserFromRequest = request => {
	const auth = request.headers.authorization;
	const { token } = JSON.parse(auth);
	return User.findByToken(token);
};

const getRepeatableJobsByID = async id => {
	const ingestMetricsJobs = await ingestMetrics.getJobs(['delayed']);
	const sendEmailJobs = await sendEmail.getJobs(['delayed']);

	return {
		ingestMetrics: await ingestMetricsJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id),
		sendEmail: await sendEmailJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id),
	};
};

const preferences = async (request, response) => {
	try {
		const { id, username, repos, metricTypes, token } = await getUserFromRequest(request);
		const user = { id, username, repos };
		const installations = await fetchUserInstallations(token);
		user.isAppInstalled = installations.total_count > 0;
		const jobs = await getRepeatableJobsByID(id);
		if (Object.keys(jobs).map(key => jobs[key]).every(job => job)) {
			user.upcomingEmailDate = moment(jobs.sendEmail.opts.prevMillis).toString();
		}

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
		const user = await getUserFromRequest(request);
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
		const user = await getUserFromRequest(request);
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

		const jobs = await getRepeatableJobsByID(id);
		const jobsToDelete = Object.keys(jobs).map(key => jobs[key]);

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

const ResubscriptionErrors = {
	INVALID_TOKEN: UnsubscriptionError('User token is invalid'),
	ALREADY_SUBSCRIBED: ResubscriptionError('User is already subscribed')
};

const resubscribe = async (request, response) => {
	try {
		const user = await getUserFromRequest(request);

		const jobs = await getRepeatableJobsByID(user.id);
		const jobsArray = Object.keys(jobs).map(key => jobs[key]);
		if (jobsArray.every(job => job)) {
			return response.status(UNAUTHORIZED).json(ResubscriptionErrors.ALREADY_SUBSCRIBED);
		}

		user.userScheduler = new UserScheduler();
		user.userScheduler.scheduleForUser(user);
		return response.status(OK).json({
			message: `Successfully re-subscribed user ${user.username}`
		});
	} catch (error) {
		logger.error(error);
		response.status(UNAUTHORIZED).json(ResubscriptionErrors.INVALID_TOKEN);
	}
};

module.exports = {
	preferences,
	updateRepos,
	updateMetricTypes,
	unsubscribe,
	resubscribe,
};

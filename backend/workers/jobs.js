const { QUEUE_CRON, QUEUE_ATTEMPTS, QUEUE_DELAY } = require('../config');
const {
	ingestMetrics,
	sendEmail,
	sendSampleEmail,
	deleteAccount,
} = require('./queues');

const ingestMetricsJob = user => {
	return ingestMetrics.add(
		{
			userID: user.id,
		},
		{
			jobId: user.id,
			repeat: {
				cron: QUEUE_CRON.METRICS,
			},
			attempts: QUEUE_ATTEMPTS.METRICS,
		},
	);
};

const sendEmailJob = user => {
	return sendEmail.add(
		{
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
			},
		},
		{
			jobId: user.id,
			repeat: {
				cron: QUEUE_CRON.EMAIL,
			},
			attempts: QUEUE_ATTEMPTS.EMAIL,
		},
	);
};

const sendSampleEmailJob = user => {
	const selectedRepos = user.repos
		.filter(repo => repo.selected)
		.map(repo => repo.name);

	return sendSampleEmail.add(
		{
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
				selectedRepos,
			},
		},
		{
			removeOnComplete: true,
			jobId: user.id,
			attempts: QUEUE_ATTEMPTS.SAMPLE,
		},
	);
};

const deleteAccountJob = user => {
	return deleteAccount.add(
		{
			userID: user.id,
		},
		{
			jobId: user.id,
			delay: QUEUE_DELAY.DELETE_ACCOUNT,
			attempts: QUEUE_ATTEMPTS.DELETE_ACCOUNT,
		},
	);
};

module.exports = {
	ingestMetricsJob,
	sendEmailJob,
	sendSampleEmailJob,
	deleteAccountJob,
};

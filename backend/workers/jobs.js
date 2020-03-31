const { QUEUE_CRON, QUEUE_ATTEMPTS } = require('../config');
const { ingestMetrics, sendEmail, sendSampleEmail } = require('./queues');

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
			jobId: user.id,
			attempts: QUEUE_ATTEMPTS.SAMPLE,
		},
	);
};

module.exports = {
	ingestMetricsJob,
	sendEmailJob,
	sendSampleEmailJob,
};

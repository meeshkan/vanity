const { QUEUE_CRON, QUEUE_ATTEMPTS } = require('../config');
const { ingestMetrics, sendEmail, sendSampleEmail } = require('./queues');

const ingestMetricsJob = user => {
	ingestMetrics.add(
		{
			userID: user.id,
		},
		{
			repeat: {
				cron: QUEUE_CRON.METRICS,
			},
			attempts: QUEUE_ATTEMPTS.METRICS,
		},
	);
};

const sendEmailJob = user => {
	sendEmail.add(
		{
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
			},
		},
		{
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
	sendSampleEmail.add(
		{
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
				selectedRepos,
			},
		},
		{
			attempts: QUEUE_ATTEMPTS.SAMPLE,
		},
	);
};

module.exports = {
	ingestMetricsJob,
	sendEmailJob,
	sendSampleEmailJob,
};

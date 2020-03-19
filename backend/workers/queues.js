const { setQueues } = require('bull-board');
const metrics = require('../utils/metrics');
const email = require('../utils/email');
const { createQueue } = require('./queue');

const ingestMetrics = createQueue('ingestMetrics');
const sendEmail = createQueue('sendEmail');
const sendSampleEmail = createQueue('sendSampleEmail');

const ingestMetricsWorker = job => {
	const { userID } = job.data;
	return metrics.ingest(userID);
};

const sendEmailWorker = async job => {
	const { user } = job.data;
	const weekMetrics = await metrics.fetchComparison(user.id);
	return email.send({
		user,
		metrics: weekMetrics
	});
};

const sendSampleEmailWorker = async job => {
	const { user } = job.data;
	const currentMetrics = await metrics.fetchCurrent(user.id, user.selectedRepos);
	return email.sendSample({
		user,
		metrics: currentMetrics
	});
};

ingestMetrics.process(ingestMetricsWorker);
sendEmail.process(sendEmailWorker);
sendSampleEmail.process(sendSampleEmailWorker);

setQueues([
	ingestMetrics,
	sendEmail,
	sendSampleEmail,
]);

module.exports = {
	ingestMetrics,
	sendEmail,
	sendSampleEmail,
	ingestMetricsWorker,
	sendEmailWorker,
	sendSampleEmailWorker,
};

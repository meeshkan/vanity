const { setQueues } = require('bull-board');
const metrics = require('./metrics');
const email = require('./email');
const { createQueue } = require('./queue');

const ingestMetrics = createQueue('ingestMetrics');
const sendEmail = createQueue('sendEmail');
const sendSampleEmail = createQueue('sendSampleEmail');

ingestMetrics.process(job => {
	const { userID } = job.data;
	metrics.ingest(userID);
});

sendEmail.process(async job => {
	const { user } = job.data;
	const weekMetrics = await metrics.fetchComparison(user.id);
	email.send(weekMetrics, user);
});

sendSampleEmail.process(async job => {
	const { user } = job.data;
	const currentMetrics = await metrics.fetchCurrent(user.id, user.selectedRepos);
	email.sendSample(currentMetrics, user);
});

setQueues([
	ingestMetrics,
	sendEmail,
	sendSampleEmail,
]);

module.exports = {
	ingestMetrics,
	sendEmail,
	sendSampleEmail,
};

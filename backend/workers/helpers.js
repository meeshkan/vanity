const { ingestMetrics, sendEmail } = require('./queues');

const getRepeatableJobsByID = async id => {
	const ingestMetricsJobs = await ingestMetrics.getJobs(['delayed']);
	const sendEmailJobs = await sendEmail.getJobs(['delayed']);

	return {
		ingestMetrics: await ingestMetricsJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id),
		sendEmail: await sendEmailJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id),
	};
};

module.exports = {
	getRepeatableJobsByID,
};

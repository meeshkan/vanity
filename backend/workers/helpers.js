const { ingestMetrics, sendEmail } = require('./queues');

const getRepeatableJobsByID = async id => {
	const ingestMetricsJobs = await ingestMetrics.getJobs(['delayed', 'waiting', 'active']);
	const sendEmailJobs = await sendEmail.getJobs(['delayed', 'waiting', 'active']);

	const matchesJobId = delayedJob => delayedJob.opts.repeat.jobId === id;
	return {
		ingestMetrics: await ingestMetricsJobs.find(delayedJob => matchesJobId(delayedJob)),
		sendEmail: await sendEmailJobs.find(delayedJob => matchesJobId(delayedJob)),
	};
};

module.exports = {
	getRepeatableJobsByID,
};

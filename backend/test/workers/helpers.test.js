const test = require('ava');
const jobs = require('../../workers/jobs');
const { getRepeatableJobsByID } = require('../../workers/helpers');
const { USER } = require('../__fixtures__');

test('getRepeatableJobsByID returns ingestMetrics and sendEmail jobs', async t => {
	const { id, username, email } = USER;
	const user = { id, username, email };

	const ingestMetricsJob = await jobs.ingestMetricsJob(user);
	const sendEmailJob = await jobs.sendEmailJob(user);

	const repeatableJobs = await getRepeatableJobsByID(id);

	t.is(repeatableJobs.ingestMetrics.id, ingestMetricsJob.id);
	t.is(repeatableJobs.sendEmail.id, sendEmailJob.id);
});

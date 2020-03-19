const test = require('ava');
const { QUEUE_CRON, QUEUE_ATTEMPTS } = require('../../config');
const { USER } = require('../../utils/__fixtures__');
const { REPOS } = require('../../api/__fixtures__');
const {
	ingestMetrics,
	sendEmail,
	sendSampleEmail,
} = require('../../workers/queues');
const {
	ingestMetricsJob,
	sendEmailJob,
	sendSampleEmailJob,
} = require('../../workers/jobs');

const user = {
	id: USER.id,
	email: USER.email,
	username: USER.username,
};

test.before('pre-test cleanup', t => {
	const queues = [ingestMetrics, sendEmail, sendSampleEmail];
	const states = ['delayed', 'wait', 'active', 'completed', 'failed'];
	queues.forEach(queue => {
		states.forEach(state => queue.clean(0, state));
	});
});

test.after('post-test cleanup', async t => {
	const repeatableQueues = [ingestMetrics, sendEmail];
	repeatableQueues.forEach(async queue => {
		const jobs = await queue.getRepeatableJobs();
		jobs.forEach(job => {
			queue.removeRepeatableByKey(job.key);
		});
	});
});

test('ingestMetricsJob creates job', async t => {
	const job = await ingestMetricsJob(user);
	t.is(job.returnvalue, null);
	t.is(job.name, '__default__');
	t.is(job.opts.attempts, QUEUE_ATTEMPTS.METRICS);
	t.deepEqual(job.data, { userID: user.id });
	t.regex(job.id, /repeat:[a-z0-9]+:\d+/);
	t.true(job.delay > 0);

	const [taskedJob] = await ingestMetrics.getRepeatableJobs();
	t.is(taskedJob.cron, QUEUE_CRON.METRICS);
	t.is(taskedJob.endDate, null);
	t.is(taskedJob.every, null);
	t.is(taskedJob.id, null);
	t.is(taskedJob.key, `__default__::::${QUEUE_CRON.METRICS}`);
	t.is(taskedJob.name, '__default__');
	t.true(taskedJob.next > 0);
	t.is(taskedJob.tz, null);
});

test('sendEmailJob creates job', async t => {
	const job = await sendEmailJob(user);
	t.is(job.returnvalue, null);
	t.is(job.name, '__default__');
	t.is(job.opts.attempts, QUEUE_ATTEMPTS.METRICS);
	t.deepEqual(job.data.user, user);
	t.regex(job.id, /repeat:[a-z0-9]+:\d+/);
	t.true(job.delay > 0);

	const [taskedJob] = await sendEmail.getRepeatableJobs();
	t.is(taskedJob.cron, QUEUE_CRON.EMAIL);
	t.is(taskedJob.endDate, null);
	t.is(taskedJob.every, null);
	t.is(taskedJob.id, null);
	t.is(taskedJob.key, `__default__::::${QUEUE_CRON.EMAIL}`);
	t.is(taskedJob.name, '__default__');
	t.true(taskedJob.next > 0);
	t.is(taskedJob.tz, null);
});

test('sendSampleEmailJob creates job', async t => {
	const repos = { repos: REPOS };
	const job = await sendSampleEmailJob({ ...user, ...repos });
	t.is(job.returnvalue, null);
	t.is(job.name, '__default__');
	t.is(job.opts.attempts, QUEUE_ATTEMPTS.METRICS);
	const selectedRepos = { selectedRepos: USER.selectedRepos };
	t.deepEqual(job.data.user, { ...user, ...selectedRepos });
	t.regex(job.id, /\d+/);
	t.is(job.delay, 0);

	const [taskedJob] = await sendSampleEmail.getRepeatableJobs();
	t.is(taskedJob, undefined);
});

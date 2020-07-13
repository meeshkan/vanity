const test = require('ava');
const { QUEUE_CRON, QUEUE_ATTEMPTS, QUEUE_DELAY } = require('../../config');
const { USER, REPOS } = require('../__fixtures__');
const {
	ingestMetrics,
	sendEmail,
	sendSampleEmail,
	deleteAccount,
} = require('../../workers/queues');
const {
	ingestMetricsJob,
	sendEmailJob,
	sendSampleEmailJob,
	deleteAccountJob,
} = require('../../workers/jobs');

const user = {
	id: USER.id,
	email: USER.email,
	username: USER.username,
};

test('ingestMetricsJob creates job', async t => {
	const job = await ingestMetricsJob(user);
	t.is(job.returnvalue, null);
	t.is(job.name, '__default__');
	t.is(job.opts.attempts, QUEUE_ATTEMPTS.METRICS);
	t.deepEqual(job.data, { userID: user.id });
	t.regex(job.id, /repeat:[a-z\d]+:\d+/);
	t.true(job.delay > 0);
	job.remove();

	const [taskedJob] = await ingestMetrics.getRepeatableJobs();
	t.is(taskedJob.cron, QUEUE_CRON.METRICS);
	t.is(taskedJob.endDate, null);
	t.is(taskedJob.every, null);
	t.regex(taskedJob.id, /\d+/);
	t.is(taskedJob.key, `__default__:${taskedJob.id}:::${QUEUE_CRON.METRICS}`);
	t.is(taskedJob.name, '__default__');
	t.true(taskedJob.next > 0);
	t.is(taskedJob.tz, null);
	ingestMetrics.removeRepeatableByKey(taskedJob.key);
});

test('sendEmailJob creates job', async t => {
	const job = await sendEmailJob(user);
	t.is(job.returnvalue, null);
	t.is(job.name, '__default__');
	t.is(job.opts.attempts, QUEUE_ATTEMPTS.METRICS);
	t.deepEqual(job.data.user, user);
	t.regex(job.id, /repeat:[a-z\d]+:\d+/);
	t.true(job.delay > 0);
	job.remove();

	const [taskedJob] = await sendEmail.getRepeatableJobs();
	t.is(taskedJob.cron, QUEUE_CRON.EMAIL);
	t.is(taskedJob.endDate, null);
	t.is(taskedJob.every, null);
	t.regex(taskedJob.id, /\d+/);
	t.is(taskedJob.key, `__default__:${taskedJob.id}:::${QUEUE_CRON.EMAIL}`);
	t.is(taskedJob.name, '__default__');
	t.true(taskedJob.next > 0);
	t.is(taskedJob.tz, null);
	sendEmail.removeRepeatableByKey(taskedJob.key);
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
	job.discard();

	const [taskedJob] = await sendSampleEmail.getRepeatableJobs();
	t.is(taskedJob, undefined);
});

test('deleteAccountJob creates job', async t => {
	const job = await deleteAccountJob(user);
	t.is(job.returnvalue, null);
	t.is(job.name, '__default__');
	t.is(job.opts.attempts, QUEUE_ATTEMPTS.DELETE_ACCOUNT);
	t.deepEqual(job.data, { userID: user.id });
	t.regex(job.id, /\d+/);
	t.is(job.delay, QUEUE_DELAY.DELETE_ACCOUNT);
	job.discard();

	const [taskedJob] = await deleteAccount.getRepeatableJobs();
	t.is(taskedJob, undefined);
});

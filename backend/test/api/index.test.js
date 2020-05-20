const { serial: test } = require('ava');
const request = require('supertest');
const { OK, UNAUTHORIZED, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('http-status');
const _ = require('lodash');
const { GH_PROFILE, USER, REPOS, METRIC_TYPES } = require('../__fixtures__');
const { GITHUB_USER_TOKEN } = require('../../config');
const { generateToken } = require('../../utils/token');
const { ingestMetrics, sendEmail } = require('../../workers/queues');
const { ingestMetricsJob, sendEmailJob } = require('../../workers/jobs');
const { User } = require('../../models');
const app = require('../../server');

const repoKeys = ['name', 'fork', 'selected'];
const containsRepoKeys = repo => repoKeys.every(key => key in repo);

test.before(async t => {
	await User.sync();
	const [user] = await User.upsert(
		{
			username: GH_PROFILE.username,
			email: USER.email,
			token: GITHUB_USER_TOKEN,
			avatar: GH_PROFILE.photos[0].value,
			repos: REPOS,
			metricTypes: METRIC_TYPES,
		},
		{
			returning: true,
		}
	);
	t.context.user = user.get({ plain: true });
});

test.before('pre-test cleanup', t => {
	const queues = [ingestMetrics, sendEmail];
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

test.after.always('cleanup', async t => {
	if (t.context.user.id) {
		await User.destroy({
			where: {
				id: t.context.user.id,
			},
		});
	}
});

test('GET /api returns 404', async t => {
	const response = await request(app).get('/api');
	t.is(response.status, NOT_FOUND);
});

test('GET /api/preferences returns 401 - unaunthenticated', async t => {
	const response = await request(app).get('/api/preferences');
	t.is(response.status, UNAUTHORIZED);
});

test('GET /api/preferences returns user w/ repos - authenticated', async t => {
	const { id, username, avatar } = t.context.user;
	const user = { id, username, avatar };
	const token = generateToken(user);

	const response = await request(app)
		.get('/api/preferences')
		.set('authorization', JSON.stringify({ token }));

	t.is(response.status, OK);
	t.is(response.body.avatar, avatar);
	t.false(response.body.exp > 0);
	t.true(response.body.iat > 0);
	t.is(response.body.id, id);
	t.true(Array.isArray(response.body.repos));
	t.is(response.body.repos.length, REPOS.length);
	t.true(response.body.repos.every(containsRepoKeys));
	t.is(response.body.username, username);
});

test('POST /api/preferences returns 401 - unaunthenticated', async t => {
	const response = await request(app).post('/api/preferences');
	t.is(response.status, UNAUTHORIZED);
});

test('POST /api/preferences updates repos - authenticated', async t => {
	const { id, username, avatar } = t.context.user;
	const user = { id, username, avatar };
	const token = generateToken(user);

	const ALTERED_REPOS = _.cloneDeep(REPOS).map(repo => {
		repo.selected = false;
		return repo;
	});

	const alteredResponse = await request(app)
		.post('/api/preferences')
		.set('authorization', JSON.stringify({ token }))
		.send({ repos: ALTERED_REPOS });

	t.is(alteredResponse.status, OK);

	const userByID = await User.findByPk(id);
	t.deepEqual(userByID.get({ plain: true }).repos, ALTERED_REPOS);
});

test('POST /api/preferences returns 500 - invalid token', async t => {
	const { username, avatar } = t.context.user;
	const user = { id: 'invalid id', username, avatar };
	const token = generateToken(user);

	const response = await request(app)
		.post('/api/preferences')
		.set('authorization', JSON.stringify({ token }))
		.send({ repos: REPOS });

	t.is(response.status, INTERNAL_SERVER_ERROR);
	t.is(response.body.name, 'SequelizeDatabaseError');
});

test('POST /api/unsubscribe returns 401 - without body', async t => {
	const response = await request(app).post('/api/unsubscribe');
	t.is(response.status, UNAUTHORIZED);
	t.is(response.body.errors.message, 'Unsubscription token is invalid');
});

test('POST /api/unsubscribe removes repeatable jobs - with appropriate body', async t => {
	const { id, email, username } = t.context.user;
	const user = { id, email };
	const token = generateToken(user);

	await ingestMetricsJob({ ...user, username });
	await sendEmailJob({ ...user, username });

	const response = await request(app)
		.post('/api/unsubscribe')
		.send({ token, email });

	t.is(response.status, OK);
	t.is(response.body.user.email, email);
	t.is(response.body.user.id, id);

	const ingestMetricsJobs = await ingestMetrics.getJobs(['delayed']);
	const sendEmailJobs = await sendEmail.getJobs(['delayed']);

	const jobs = [
		ingestMetricsJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id),
		sendEmailJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id)
	];

	t.true(jobs.every(job => !job));
});

test('POST /api/unsubscribe rejects tampered email', async t => {
	const { id, email, username } = t.context.user;
	const user = { id, email };
	const token = generateToken(user);

	await ingestMetricsJob({ ...user, username });
	await sendEmailJob({ ...user, username });

	const response = await request(app)
		.post('/api/unsubscribe')
		.send({ token, email: 'foo@bar.com' });

	t.is(response.status, UNAUTHORIZED);
	t.is(response.body.errors.message, 'Email did not match token');

	const ingestMetricsJobs = await ingestMetrics.getJobs(['delayed']);
	const sendEmailJobs = await sendEmail.getJobs(['delayed']);

	const jobs = [
		ingestMetricsJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id),
		sendEmailJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id)
	];

	t.false(jobs.every(job => !job));
});

test('POST /api/unsubscribe returns error when email has already been unsubscribed', async t => {
	const { id, email, username } = t.context.user;
	const user = { id, email };
	const token = generateToken(user);

	await ingestMetricsJob({ ...user, username });
	await sendEmailJob({ ...user, username });

	await request(app)
		.post('/api/unsubscribe')
		.send({ token, email });

	const response = await request(app)
		.post('/api/unsubscribe')
		.send({ token, email });

	t.is(response.status, UNAUTHORIZED);
	t.is(response.body.errors.message, 'Email has already been unsubscribed');

	const ingestMetricsJobs = await ingestMetrics.getJobs(['delayed']);
	const sendEmailJobs = await sendEmail.getJobs(['delayed']);

	const jobs = [
		ingestMetricsJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id),
		sendEmailJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id)
	];

	t.true(jobs.every(job => !job));
});

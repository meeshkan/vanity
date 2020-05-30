const test = require('ava');
const request = require('supertest');
const { OK, UNAUTHORIZED, NOT_FOUND } = require('http-status');
const _ = require('lodash');
const { REPOS, METRIC_TYPES } = require('../__fixtures__');
const { createTestUser, destroyTestUser, setUserToken, getUserById } = require('../helpers');
const { GITHUB_USER_TOKEN, GITHUB_NO_INSTALLATION_USER_TOKEN } = require('../../config');
const { generateToken } = require('../../utils/token');
const { ingestMetrics, sendEmail } = require('../../workers/queues');
const { ingestMetricsJob, sendEmailJob } = require('../../workers/jobs');
const app = require('../../server');

const REPO_KEYS = ['name', 'fork', 'selected'];
const containsRepoKeys = repo => REPO_KEYS.every(key => key in repo);

test.serial.before('create test user', createTestUser);
test.serial.after.always('destroy test user', destroyTestUser);

test('GET /api returns 404', async t => {
	const response = await request(app).get('/api');
	t.is(response.status, NOT_FOUND);
});

test('GET /api/preferences returns 401 - unaunthenticated', async t => {
	const response = await request(app).get('/api/preferences');
	t.is(response.status, UNAUTHORIZED);
});

test('GET /api/preferences returns user w/ repos and metric types - authenticated', async t => {
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
	t.deepEqual(response.body.metricTypes, METRIC_TYPES);
});

test.serial('GET /api/preferences returns disabled views and clones - authenticated w/o app installation', async t => {
	const { id, username, avatar } = t.context.user;
	const user = { id, username, avatar };
	const token = generateToken(user);

	const ALTERED_METRIC_TYPES = _.cloneDeep(METRIC_TYPES).map(metricType => {
		if (['views', 'clones'].includes(metricType.name)) {
			metricType.disabled = true;
			metricType.selected = false;
		}

		return metricType;
	});

	await setUserToken(t.context.user, GITHUB_NO_INSTALLATION_USER_TOKEN);

	const response = await request(app)
		.get('/api/preferences')
		.set('authorization', JSON.stringify({ token }));

	t.is(response.status, OK);
	t.deepEqual(response.body.metricTypes, ALTERED_METRIC_TYPES);

	await setUserToken(t.context.user, GITHUB_USER_TOKEN);
});

test('POST /api/preferences/repos returns 401 - unaunthenticated', async t => {
	const response = await request(app).post('/api/preferences/repos');
	t.is(response.status, UNAUTHORIZED);
});

test('POST /api/preferences/repos updates repos - authenticated', async t => {
	const { id, username, avatar } = t.context.user;
	const user = { id, username, avatar };
	const token = generateToken(user);

	const ALTERED_REPOS = _.cloneDeep(REPOS).map(repo => {
		repo.selected = false;
		return repo;
	});

	const alteredResponse = await request(app)
		.post('/api/preferences/repos')
		.set('authorization', JSON.stringify({ token }))
		.send({ repos: ALTERED_REPOS });

	t.is(alteredResponse.status, OK);

	const userByID = await getUserById(id);
	t.deepEqual(userByID.repos, ALTERED_REPOS);
});

test('POST /api/preferences/repos returns 401 - invalid token', async t => {
	const { username, avatar } = t.context.user;
	const user = { id: 'invalid id', username, avatar };
	const token = generateToken(user);

	const response = await request(app)
		.post('/api/preferences/repos')
		.set('authorization', JSON.stringify({ token }))
		.send({ repos: REPOS });

	t.is(response.status, UNAUTHORIZED);
	t.is(response.body.name, 'SequelizeDatabaseError');
});

test('POST /api/preferences/metric-types returns 401 - unaunthenticated', async t => {
	const response = await request(app).post('/api/preferences/metric-types');
	t.is(response.status, UNAUTHORIZED);
});

test('POST /api/preferences/metric-types updates metric types - authenticated', async t => {
	const { id, username, avatar } = t.context.user;
	const user = { id, username, avatar };
	const token = generateToken(user);

	const ALTERED_METRIC_TYPES = _.cloneDeep(METRIC_TYPES).map(metricType => {
		metricType.selected = false;
		return metricType;
	});

	const alteredResponse = await request(app)
		.post('/api/preferences/metric-types')
		.set('authorization', JSON.stringify({ token }))
		.send({ metricTypes: ALTERED_METRIC_TYPES });

	t.is(alteredResponse.status, OK);

	const userByID = await getUserById(id);
	t.deepEqual(userByID.metricTypes, ALTERED_METRIC_TYPES);
});

test('POST /api/preferences/metric-types returns 401 - invalid token', async t => {
	const { username, avatar } = t.context.user;
	const user = { id: 'invalid id', username, avatar };
	const token = generateToken(user);

	const response = await request(app)
		.post('/api/preferences/metric-types')
		.set('authorization', JSON.stringify({ token }))
		.send({ metricTypes: METRIC_TYPES });

	t.is(response.status, UNAUTHORIZED);
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

test.serial('POST /api/unsubscribe rejects tampered email', async t => {
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

test.serial('POST /api/unsubscribe returns error when email has already been unsubscribed', async t => {
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

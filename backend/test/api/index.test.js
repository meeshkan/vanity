const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');
const moment = require('moment');
const { OK, UNAUTHORIZED, NOT_FOUND } = require('http-status');
const _ = require('lodash');
const { REPOS, METRIC_TYPES } = require('../__fixtures__');
const { createTestUser, destroyTestUser, setUserToken, getUserById } = require('../helpers');
const { GITHUB_USER_TOKEN, GITHUB_NO_INSTALLATION_USER_TOKEN } = require('../../config');
const { generateToken } = require('../../utils/token');
const { ingestMetrics, sendEmail, deleteAccount } = require('../../workers/queues');
const { UserScheduler } = require('../../models/user-scheduler');
const {
	ingestMetricsJob,
	sendEmailJob,
	deleteAccountJob,
} = require('../../workers/jobs');
const app = require('../../server');

const REPO_KEYS = ['name', 'fork', 'selected'];

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

test.serial('GET /api/preferences returns user w/ repos and metric types - authenticated', async t => {
	const { id, username, avatar } = t.context.user;
	const user = { id, username, avatar };
	const token = generateToken(user);

	const response = await request(app)
		.get('/api/preferences')
		.set('authorization', JSON.stringify({ token }));

	t.is(response.status, OK);
	t.is(response.body.id, id);
	t.true(Array.isArray(response.body.repos));
	t.is(response.body.repos.length, REPOS.length);
	response.body.repos.forEach(repo => t.deepEqual(Object.keys(repo), REPO_KEYS));
	t.is(response.body.username, username);
	t.deepEqual(response.body.metricTypes, METRIC_TYPES);
});

test.serial('GET /api/preferences returns upcoming email date - subscribed', async t => {
	const { id, username, avatar } = t.context.user;
	const user = { id, username, avatar };
	const token = generateToken(user);

	await ingestMetricsJob({ ...user, username });
	await sendEmailJob({ ...user, username });

	const response = await request(app)
		.get('/api/preferences')
		.set('authorization', JSON.stringify({ token }));

	t.is(response.status, OK);

	const thisMondayAtMidnight = moment().day(1).startOf('day');
	const upcomingMondayAtMidnight = thisMondayAtMidnight < moment() ? moment().day(8).startOf('day') : thisMondayAtMidnight;
	const expectedUpcomingEmailDate = upcomingMondayAtMidnight.toString();

	t.is(response.body.upcomingEmailDate, expectedUpcomingEmailDate);

	const ingestMetricsJobs = await ingestMetrics.getJobs(['delayed']);
	const sendEmailJobs = await sendEmail.getJobs(['delayed']);

	const jobsToDelete = [
		ingestMetricsJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id),
		sendEmailJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id),
	];

	jobsToDelete.forEach(job => job.remove());
});

test.serial('GET /api/preferences returns undefined upcoming email date - unsubscribed', async t => {
	const { id, username, avatar } = t.context.user;
	const user = { id, username, avatar };
	const token = generateToken(user);

	const response = await request(app)
		.get('/api/preferences')
		.set('authorization', JSON.stringify({ token }));

	t.is(response.status, OK);
	t.is(response.body.upcomingEmailDate, undefined);
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

test('POST /api/resubscribe returns 401 - without token', async t => {
	const response = await request(app).post('/api/resubscribe');
	t.is(response.status, UNAUTHORIZED);
	t.is(response.body.errors.message, 'User token is invalid');
});

test.serial('POST /api/resubscribe schedules repeatable jobs - with appropriate token', async t => {
	const { id, email, username } = t.context.user;
	const user = { id, email };
	const token = generateToken(user);

	const scheduleForUser = sinon.stub(UserScheduler.prototype, 'scheduleForUser');
	scheduleForUser.returns();

	const response = await request(app)
		.post('/api/resubscribe')
		.set('authorization', JSON.stringify({ token }));

	t.is(response.status, OK);
	t.is(response.body.message, `Successfully re-subscribed user ${username}`);

	t.true(scheduleForUser.calledOnce);
	scheduleForUser.restore();
});

test.serial('POST /api/resubscribe return error when already subscribed', async t => {
	const { id, email, username } = t.context.user;
	const user = { id, email };
	const token = generateToken(user);

	await ingestMetricsJob({ ...user, username });
	await sendEmailJob({ ...user, username });

	const response = await request(app)
		.post('/api/resubscribe')
		.set('authorization', JSON.stringify({ token }));

	t.is(response.status, UNAUTHORIZED);
	t.is(response.body.errors.message, 'User is already subscribed');

	const ingestMetricsJobs = await ingestMetrics.getJobs(['delayed']);
	const sendEmailJobs = await sendEmail.getJobs(['delayed']);

	const jobsToDelete = [
		ingestMetricsJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id),
		sendEmailJobs.find(delayedJob => delayedJob.opts.repeat.jobId === id),
	];

	jobsToDelete.forEach(job => job.remove());
});

test('POST /api/delete-account returns 401 - without token', async t => {
	const response = await request(app).post('/api/delete-account');
	t.is(response.status, UNAUTHORIZED);
	t.is(response.body.errors.message, 'User token is invalid');
});

test.serial('POST /api/delete-account schedules user deletion job - with appropriate token', async t => {
	const { id, email, username } = t.context.user;
	const user = { id, email };
	const token = generateToken(user);

	const scheduleDeletionOfUser = sinon.stub(UserScheduler.prototype, 'scheduleDeletionOfUser');
	scheduleDeletionOfUser.returns();

	const response = await request(app)
		.post('/api/delete-account')
		.set('authorization', JSON.stringify({ token }));

	t.is(response.status, OK);
	t.is(response.body.message, `Successfully scheduled deletion of user ${username}`);

	t.true(scheduleDeletionOfUser.calledOnce);
	scheduleDeletionOfUser.restore();
});

test.serial('POST /api/delete-account returns error - when user does not exist', async t => {
	const user = { id: 1337, email: 'foo@bar.com' };
	const token = generateToken(user);

	const response = await request(app)
		.post('/api/delete-account')
		.set('authorization', JSON.stringify({ token }));

	t.is(response.status, NOT_FOUND);
	t.is(response.body.errors.message, 'The user that you are trying to delete does not exist');
});

test('POST /api/cancel-deletion returns 401 - without token', async t => {
	const response = await request(app).post('/api/cancel-deletion');
	t.is(response.status, UNAUTHORIZED);
	t.is(response.body.errors.message, 'User token is invalid');
});

test.serial('POST /api/cancel-deletion removes deleteAccount job - with appropriate token', async t => {
	const { id, email, username } = t.context.user;
	const user = { id, email };
	const token = generateToken(user);

	await deleteAccountJob(user);

	const response = await request(app)
		.post('/api/cancel-deletion')
		.set('authorization', JSON.stringify({ token }));

	t.is(response.status, OK);
	t.is(response.body.message, `Successfully recovered the account of user ${username}`);

	const job = await deleteAccount.getJob(user.id);
	t.is(job, null);
});

test.serial('POST /api/cancel-deletion returns error - when user does not exist', async t => {
	const user = { id: 1337, email: 'foo@bar.com' };
	const token = generateToken(user);

	const response = await request(app)
		.post('/api/cancel-deletion')
		.set('authorization', JSON.stringify({ token }));

	t.is(response.status, NOT_FOUND);
	t.is(response.body.errors.message, 'The user that you are trying to recover does not exist');
});

const test = require('ava');
const { GH_PROFILE, METRIC_TYPES } = require('../__fixtures__');
const { createTestUser, destroyTestUser } = require('../helpers');
const {
	fetchUserRepos,
	fetchUserRepoStats,
	fetchUserEmails,
	fetchUserInstallations,
} = require('../../utils/github');

const REPO_KEYS = ['name', 'fork'];
const EMAIL_KEYS = ['email', 'primary', 'verified', 'visibility'];

const EMAIL_REGEX = /.+@.+\..+/;

test.serial.before('create test user', createTestUser);
test.serial.after.always('destroy test user', destroyTestUser);

test('fetchUserRepos() fetches user repos', async t => {
	const { username, token } = t.context.user;
	const repos = await fetchUserRepos(username, token);
	t.true(repos.length > 0);
	repos.forEach(repo => t.deepEqual(Object.keys(repo), REPO_KEYS));
});

test.serial('fetchUserRepoStats() fetches user repo stats', async t => {
	t.timeout(10000);
	const repos = await fetchUserRepoStats(t.context.user.id);
	t.true(repos.length > 0);

	const expectedStatKeys = METRIC_TYPES
		.filter(metricType => !metricType.disabled)
		.map(metricType => metricType.name)
		.concat(['name'])
		.sort();

	repos.forEach(repo => {
		const actualStatKeys = Object.keys(repo).sort();
		t.deepEqual(actualStatKeys, expectedStatKeys);
	});
});

test('fetchUserEmails() fetches user emails', async t => {
	const { username, token } = t.context.user;
	const emails = await fetchUserEmails(username, token);
	emails.forEach(emailObject => Object.keys(emailObject), EMAIL_KEYS);
	emails.forEach(emailObject => t.regex(emailObject.email, EMAIL_REGEX));
});

test('fetchUserInstallations() fetches user installations', async t => {
	const { token } = t.context.user;
	const installations = await fetchUserInstallations(token);
	t.is(installations.total_count, 1);
	t.is(installations.installations[0].account.login, GH_PROFILE.username);
	t.is(installations.installations[0].app_slug, 'vanity-dev');
	t.deepEqual(installations.installations[0].permissions, { administration: 'read', metadata: 'read' });
});

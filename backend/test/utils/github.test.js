const test = require('ava');
const _ = require('lodash');
const { GH_PROFILE, METRIC_TYPES } = require('../__fixtures__');
const { createTestUser, destroyTestUser, setUserMetricTypes } = require('../helpers');
const {
	fetchUserRepos,
	fetchUserRepoStats,
	fetchUserEmails,
	fetchUserInstallations,
} = require('../../utils/github');

const REPO_KEYS = ['fork', 'name'];
const containsRepoKeys = repo => REPO_KEYS.every(key => key in repo);

const containsRepoStatKeys = (repo, repoStatKeys) => repoStatKeys.every(key => key in repo);

const EMAIL_REGEX = /.+@.+\..+/;

test.serial.before('create test user', createTestUser);
test.serial.after.always('destroy test user', destroyTestUser);

test('fetchUserRepos() fetches user repos', async t => {
	const { username, token } = t.context.user;
	const repos = await fetchUserRepos(username, token);
	t.true(repos.length > 0);
	t.true(repos.every(containsRepoKeys));
});

test.serial('fetchUserRepoStats() fetches user repo stats with ALL metric types selected', async t => {
	t.timeout(10000);
	const repos = await fetchUserRepoStats(t.context.user.id);
	t.true(repos.length > 0);
	const repoStatKeys = METRIC_TYPES
		.filter(metricType => metricType.selected)
		.map(metricType => metricType.name);
	t.true(repos.every(repo => containsRepoStatKeys(repo, repoStatKeys)));
});

test.serial('fetchUserRepoStats() fetches user repo stats with SOME metric types selected', async t => {
	t.timeout(10000);
	const { id } = t.context.user;

	const ALTERED_METRIC_TYPES = _.cloneDeep(METRIC_TYPES).map(metricType => {
		if (['views', 'stars'].includes(metricType.name)) {
			metricType.selected = false;
		}

		return metricType;
	});

	await setUserMetricTypes(t.context.user, ALTERED_METRIC_TYPES);

	const repos = await fetchUserRepoStats(id);
	t.true(repos.length > 0);
	const repoStatKeys = ALTERED_METRIC_TYPES
		.filter(metricType => metricType.selected)
		.map(metricType => metricType.name);
	t.true(repos.every(repo => containsRepoStatKeys(repo, repoStatKeys)));
});

test('fetchUserEmails() fetches user emails', async t => {
	const { username, token } = t.context.user;
	const emails = await fetchUserEmails(username, token);
	const emailKeys = ['email', 'primary', 'verified', 'visibility'];
	const containsEmailKeys = emailObject => emailKeys.every(key => key in emailObject);
	t.true(emails.every(containsEmailKeys));
	const containsEmail = emailObject => emailObject.email.match(EMAIL_REGEX);
	t.true(emails.every(containsEmail));
});

test('fetchUserInstallations() fetches user installations', async t => {
	const { token } = t.context.user;
	const installations = await fetchUserInstallations(token);
	t.is(installations.total_count, 1);
	t.is(installations.installations[0].account.login, GH_PROFILE.username);
	t.is(installations.installations[0].app_slug, 'vanity-dev');
	t.deepEqual(installations.installations[0].permissions, { administration: 'read', metadata: 'read' });
});

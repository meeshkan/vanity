const test = require('ava');
const _ = require('lodash');
const { User } = require('../../models');
const { GITHUB_USER_TOKEN } = require('../../config');
const { GH_PROFILE, USER, METRIC_TYPES } = require('../__fixtures__');
const {
	fetchUserRepos,
	fetchUserRepoStats,
	fetchUserEmails,
	fetchUserInstallations,
} = require('../../utils/github');

const repoKeys = ['fork', 'name'];
const containsRepoKeys = repo => repoKeys.every(key => key in repo);

const containsRepoStatKeys = (repo, repoStatKeys) => repoStatKeys.every(key => key in repo);

const emailRegex = /.+@.+\..+/;

test.before(async t => {
	await User.sync();
	const [user] = await User.upsert(
		{
			username: GH_PROFILE.username,
			email: USER.email,
			token: GITHUB_USER_TOKEN,
			avatar: GH_PROFILE.photos[0].value,
			metricTypes: METRIC_TYPES,
		},
		{
			returning: true,
		}
	);
	t.context.user = user.get({ plain: true });
});

test('fetchUserRepos() fetches user repos', async t => {
	const { username, token } = t.context.user;
	const repos = await fetchUserRepos(username, token);
	t.true(repos.length > 0);
	t.true(repos.every(containsRepoKeys));
});

test('fetchUserRepoStats() fetches user repo stats with ALL metric types selected', async t => {
	t.timeout(10000);
	const repos = await fetchUserRepoStats(t.context.user.id);
	t.true(repos.length > 0);
	const repoStatKeys = METRIC_TYPES
		.filter(metricType => metricType.selected)
		.map(metricType => metricType.name);
	t.true(repos.every(repo => containsRepoStatKeys(repo, repoStatKeys)));
});

test('fetchUserRepoStats() fetches user repo stats with SOME metric types selected', async t => {
	t.timeout(10000);
	const { id } = t.context.user;

	const ALTERED_METRIC_TYPES = _.cloneDeep(METRIC_TYPES).map(metricType => {
		if (['views', 'stars'].includes(metricType.name)) {
			metricType.selected = false;
		}

		return metricType;
	});

	await User.update(
		{
			metricTypes: ALTERED_METRIC_TYPES,
		},
		{
			where: { id },
		}
	);

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
	const containsEmail = emailObject => emailObject.email.match(emailRegex);
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

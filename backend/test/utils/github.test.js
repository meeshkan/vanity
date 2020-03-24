const test = require('ava');
const { User } = require('../../models');
const { GH_PROFILE } = require('../__fixtures__');
const {
	fetchUserRepos,
	fetchUserRepoStats,
} = require('../../utils/github');

const repoKeys = ['fork', 'name'];
const containsRepoKeys = repo => repoKeys.every(key => key in repo);

const repoStatKeys = ['forks', 'name', 'stars'];
const containsRepoStatKeys = repo => repoStatKeys.every(key => key in repo);

test.before(async t => {
	await User.sync();
	const [user] = await User.upsert(
		{
			username: GH_PROFILE.username,
			email: GH_PROFILE.email,
			token: undefined,
			avatar: GH_PROFILE.photos[0].value,
		},
		{
			returning: true,
		}
	);
	t.context.user = user.get({ plain: true });
});

test('fetchUserRepos() fetches user repos', async t => {
	const repos = await fetchUserRepos(t.context.user.username, t.context.user.token);
	t.true(repos.length > 0);
	t.true(repos.every(containsRepoKeys));
});

test('fetchUserRepoStats() fetches user repo stats', async t => {
	const repos = await fetchUserRepoStats(t.context.user.id);
	t.true(repos.length > 0);
	t.true(repos.every(containsRepoStatKeys));
});

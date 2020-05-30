const { serial: test } = require('ava');
const { createStrategyCallback } = require('../../auth/passport');
const { GH_PROFILE } = require('../__fixtures__');
const { syncUserModel, getNewestUser } = require('../helpers');
const { DummyUserScheduler } = require('../../models/user-scheduler');
const { GITHUB_USER_TOKEN } = require('../../config');

const USER_REPO_KEYS = ['name', 'fork', 'selected'];
const containsUserRepoKeys = repo => USER_REPO_KEYS.every(key => key in repo);

test.before('synchronize user model', syncUserModel);

test.cb('passport callback creates user', t => {
	const strategyCallback = createStrategyCallback(DummyUserScheduler);
	strategyCallback(GITHUB_USER_TOKEN, undefined, GH_PROFILE, (error, user) => {
		t.is(error, null);
		t.not(user, null);
		t.is(user.avatar, GH_PROFILE.photos[0].value);
		t.regex(String(user.id), /\d+/);
		t.is(user.username, GH_PROFILE.username);
		t.end();
	});
});

test('user was stored in DB', async t => {
	const user = await getNewestUser();
	t.not(user, null);
	t.false(user.admin);
	t.is(user.avatar, GH_PROFILE.photos[0].value);
	t.true(user.createdAt instanceof Date);
	t.true(Array.isArray(user.repos));
	t.true(user.repos.length > 0);
	t.true(user.repos.every(containsUserRepoKeys));
	t.is(user.username, GH_PROFILE.username);
	await user.destroy();
});

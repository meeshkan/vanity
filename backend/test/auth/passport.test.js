const { serial: test } = require('ava');
const { strategyCallback } = require('../../auth/passport');
const { GH_PROFILE, USER } = require('../__fixtures__');
const { User } = require('../../models');
const { GITHUB_USER_TOKEN } = require('../../config');

const USER_REPO_KEYS = ['name', 'fork', 'selected'];
const containsUserRepoKeys = repo => USER_REPO_KEYS.every(key => key in repo);

test.before(async t => {
	await User.sync();
	t.pass();
});

test.cb('passport callback creates user', t => {
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
	const id = await User.max('id');
	const userByID = await User.findByPk(id);
	t.not(userByID, null);
	const user = userByID.get({ plain: true });
	t.not(user, null);
	t.false(user.admin);
	t.is(user.avatar, GH_PROFILE.photos[0].value);
	t.true(user.createdAt instanceof Date);
	t.is(user.id, id);
	t.true(Array.isArray(user.repos));
	t.true(user.repos.length > 0);
	t.true(user.repos.every(containsUserRepoKeys));
	t.is(user.username, GH_PROFILE.username);

	await User.destroy({
		where: {
			id,
		},
	});
});

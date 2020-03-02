const { serial: test } = require('ava');
const { strategyCallback } = require('../../auth/passport');
const { GH_PROFILE } = require('../../auth/__fixtures__');
const { User } = require('../../models');

const userRepoKeys = ['name', 'fork', 'selected'];
const containsUserRepoKeys = repo => userRepoKeys.every(key => key in repo);

test.cb('passport callback creates user', t => {
	strategyCallback(undefined, undefined, GH_PROFILE, (error, user) => {
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
	t.is(user.email, GH_PROFILE.emails[0].value);
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

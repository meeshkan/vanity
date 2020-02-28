const test = require('ava');
const { strategyCallback } = require('../../auth/passport');
const { GH_PROFILE } = require('../../auth/__fixtures__');
const { User } = require('../../models');

const userRepoKeys = ['name', 'fork', 'selected'];
const containsUserRepoKeys = repo => userRepoKeys.every(key => key in repo);

test.serial.cb('passport callback creates user', t => {
	strategyCallback(undefined, undefined, GH_PROFILE, (error, user) => {
        t.is(error, null);
		t.not(user, null);
		t.is(user.avatar, GH_PROFILE.photos[0].value);
		t.is(user.id, 1);
		t.is(user.username, GH_PROFILE.username);
		t.end();
	});
});

test.serial('user was stored in DB', async t => {
	const userByID = await User.findByPk(1);
	t.not(userByID, null);
	const user = userByID.get({ plain: true });
	t.not(user, null);
	t.false(user.admin);
	t.is(user.avatar, GH_PROFILE.photos[0].value);
	t.true(user.createdAt instanceof Date);
	t.is(user.email, GH_PROFILE.emails[0].value);
	t.is(user.id, 1);
	t.true(Array.isArray(user.repos));
	t.true(user.repos.length > 0);
	t.true(user.repos.every(containsUserRepoKeys));
	t.is(user.username, GH_PROFILE.username);
});

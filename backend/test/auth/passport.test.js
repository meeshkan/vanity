const test = require('ava');
const { strategyCallback } = require('../../auth/passport');
const { GH_PROFILE } = require('../../auth/__fixtures__');

test.cb('passport strategy callback', t => {
	strategyCallback(undefined, undefined, GH_PROFILE, (error, user) => {
        t.is(error, null);
		t.is(user.username, GH_PROFILE.username);
		t.is(user.avatar, GH_PROFILE.photos[0].value);
		t.end();
	});
});

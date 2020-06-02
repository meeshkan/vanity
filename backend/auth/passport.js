const passport = require('passport');
const GithubStrategy = require('passport-github').Strategy;
const { User } = require('../models');
const { UserScheduler } = require('../models/user-scheduler');
const { PASSPORT_OPTIONS, NODE_ENV } = require('../config');

const USER_FIELDS_TO_FILTER = ['admin', 'token', 'email', 'updatedAt', 'createdAt', 'repos'];

const filterUser = user => {
	USER_FIELDS_TO_FILTER.forEach(key => delete user[key]);
	return user;
};

const createStrategyCallback = UserSchedulerClass => {
	const strategyCallback = async (accessToken, refreshToken, profile, done) => {
		const { username, photos } = profile;
		let user = await User.findFromUsername(username);

		if (user) {
			try {
				await user.updateFromGitHub();
			} catch (error) {
				return done(error);
			}
		} else {
			user = await User.create({
				username,
				avatar: photos[0].value,
				token: accessToken
			}, { userSchedulerClass: UserSchedulerClass });
		}

		return done(null, filterUser(user));
	};

	return strategyCallback;
};

passport.use(
	new GithubStrategy(
		PASSPORT_OPTIONS[NODE_ENV],
		createStrategyCallback(UserScheduler)
	),
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = {
	passport,
	createStrategyCallback,
};

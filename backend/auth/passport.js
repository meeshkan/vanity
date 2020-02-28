const passport = require('passport');
const GithubStrategy = require('passport-github').Strategy;
const _ = require('lodash');
const { User } = require('../models');
const { fetchUserRepos } = require('../utils/github');
const {
	ingestMetricsJob,
	sendEmailJob,
	sendSampleEmailJob
} = require('../workers/jobs');
const { PASSPORT_OPTIONS, NODE_ENV } = require('../config');

const getPrimaryEmail = emails => emails.filter(email => email.primary)[0].value; // TODO: ask user which email he/she prefers to use

const filterUser = user => {
	['admin', 'token', 'email', 'updatedAt', 'createdAt', 'repos'].forEach(key => {
		delete user[key];
	});
	return user;
};

const containSameElements = (x, y) => _.isEqual(_.sortBy(x), _.sortBy(y));

const strategyCallback = async (accessToken, refreshToken, profile, done) => {
	const { username, emails, photos } = profile;
	const email = getPrimaryEmail(emails);
	let latestRepos = await fetchUserRepos(username, accessToken);
	User.upsert(
		{
			username,
			email,
			token: accessToken,
			avatar: photos && photos.length > 0 ? photos[0].value : 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
		},
		{
			returning: true,
			fields: ['username', 'email', 'token', 'avatar'],
		}
	)
		.then(([user, created]) => {
			user = user.get({ plain: true });

			// TODO: move this to a function & re-call it with a `sync` button in /preferences
			const latestReposNames = latestRepos.map(repo => repo.name);
			if (!(user.repos && containSameElements(latestReposNames, user.repos.map(repo => repo.name)))) {
				latestRepos = latestRepos.map(repo => {
					repo.selected = !repo.fork;
					return repo;
				});

				if (user.repos === null) {
					user.repos = latestRepos;
				} else {
					latestRepos.forEach(repo => {
						if (!(repo.name in user.repos.map(repo => repo.name))) {
							user.repos.push(repo);
						}
					});
				}

				User.update(
					{
						repos: user.repos,
					},
					{
						where: {
							id: user.id,
						},
						fields: ['repos'],
					},
				); // TODO: handle response
			}

			if (created) {
				ingestMetricsJob(user);
				sendSampleEmailJob(user);
				sendEmailJob(user);
			}

			return done(null, filterUser(user));
		})
		.catch(error => {
			return done(error);
		});
};

passport.use(
	new GithubStrategy(
		PASSPORT_OPTIONS[NODE_ENV],
		strategyCallback
	),
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = {
	passport,
	strategyCallback,
};

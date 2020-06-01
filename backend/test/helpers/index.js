const { GH_PROFILE, USER, REPOS, METRIC_TYPES, SAMPLE_METRICS } = require('../__fixtures__');
const { GITHUB_USER_TOKEN } = require('../../config');
const { User, Snapshot } = require('../../models');
const { DummyUserScheduler } = require('../../models/user-scheduler');

const TEST_USER_VALUES = {
	username: GH_PROFILE.username,
	email: USER.email,
	token: GITHUB_USER_TOKEN,
	avatar: GH_PROFILE.photos[0].value,
	repos: REPOS,
	metricTypes: METRIC_TYPES,
};

const createTestUser = async t => {
	await User.sync();
	const user = await User.create(TEST_USER_VALUES, {
		returning: true,
		userSchedulerClass: DummyUserScheduler,
	});
	t.context.user = user;
};

const createTestSnapshot = async t => {
	await Snapshot.sync();
	const snapshot = await Snapshot.create(
		{
			metrics: SAMPLE_METRICS,
			userId: t.context.user.id,
		},
		{
			returning: true,
		}
	);
	t.context.snapshot = snapshot;
};

const destroyTestUser = t => t.context.user.destroy();

const destroyTestSnapshot = t => t.context.snapshot.destroy();

const setUserAdmin = (user, admin) => {
	user.admin = admin;
	return user.save();
};

const setUserToken = (user, token) => {
	user.token = token;
	return user.save();
};

const setUserMetricTypes = (user, metricTypes) => {
	user.metricTypes = metricTypes;
	return user.save();
};

const getUserById = id => User.findByPk(id);

const getNewestUser = async () => {
	const maxId = await User.max('id');
	return User.findByPk(maxId);
};

const createSnapshot = (values, options) => Snapshot.create(values, options);

const syncUserModel = async t => {
	await User.sync();
	t.pass();
};

module.exports = {
	createTestUser,
	createTestSnapshot,
	destroyTestUser,
	destroyTestSnapshot,
	setUserAdmin,
	setUserToken,
	setUserMetricTypes,
	getUserById,
	getNewestUser,
	createSnapshot,
	syncUserModel,
};

const { serial: test } = require('ava');
const moment = require('moment');
const _ = require('lodash');
const { USER, SAMPLE_METRICS } = require('../../utils/__fixtures__');
const { GH_PROFILE } = require('../../auth/__fixtures__');
const { User, Snapshot } = require('../../models');
const {
	userSnapshots,
	ingest,
	fetchCurrent,
	compareSnapshots,
	daysSinceSnapshot,
	subjectedSnapshot,
	fetchComparison,
} = require('../../utils/metrics');

const repoKeys = ['name', 'stars', 'forks'];
const containsRepoKeys = repo => repoKeys.every(key => key in repo);

const comparsionKeys = ['latest', 'difference'];
const containsComparisonKeys = repo => repoKeys.every(key => {
	if (key === 'name') {
		return true;
	}

	return comparsionKeys.every(comparsionKey => comparsionKey in repo[key]);
});

const dateIsNDaysAgo = (date, days) => moment(date).add(days, 'days').isSame(moment(), 'day');

test.before(async t => {
	await User.sync();
	await Snapshot.sync();
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
	t.context.userId = user.get({ plain: true }).id;
	const snapshot = await Snapshot.create(
		{
			metrics: SAMPLE_METRICS,
			userId: t.context.userId,
		},
		{
			returning: true,
		}
	);
	t.context.snapshotId = snapshot.get({ plain: true }).id;
});

test('userSnapshots() finds user snapshots', async t => {
	const snapshots = await userSnapshots(t.context.userId);
	t.true(snapshots.length > 0);
	t.is(snapshots[0].userId, t.context.userId);
	t.is(snapshots[0].id, t.context.snapshotId);
});

test('ingest() ingests metrics', async t => {
	const snapshotByUserID = await ingest(t.context.userId);
	const snapshot = snapshotByUserID.get({ plain: true });
	t.is(snapshot.userId, t.context.userId);
	t.true(snapshot.metrics.length > 0);
	t.true(snapshot.id > t.context.snapshotId);

	await Snapshot.destroy({
		where: {
			id: snapshot.id,
		},
	});
});

test('fetchCurrent() fetches current metrics', async t => {
	const metrics = await fetchCurrent(t.context.userId, USER.selectedRepos);
	t.true(Array.isArray(metrics));
	t.true(metrics.length === USER.selectedRepos.length);
	t.true(metrics.every(containsRepoKeys));
});

test('compareSnapshots() compares snapshots', async t => {
	const STAR_DIFFERENCE = 2;
	const FORK_DIFFERENCE = 1;

	const [snapshot] = await userSnapshots(t.context.userId);

	const alteredSnapshot = _.cloneDeep(snapshot);
	alteredSnapshot.metrics.map(repo => {
		repo.stars += STAR_DIFFERENCE;
		repo.forks += FORK_DIFFERENCE;
		return repo;
	});

	const comparison = await compareSnapshots({
		latest: _.cloneDeep(snapshot),
		previous: snapshot
	});
	t.true(comparison.length > 0);
	t.true(comparison.every(containsRepoKeys));
	t.true(comparison.every(containsComparisonKeys));

	const alteredComparison = await compareSnapshots({
		latest: alteredSnapshot,
		previous: snapshot
	});
	t.true(alteredComparison.length > 0);
	t.true(alteredComparison.every(containsRepoKeys));
	t.true(alteredComparison.every(containsComparisonKeys));
	t.true(alteredComparison.every(repo => repo.stars.difference === STAR_DIFFERENCE));
	t.true(alteredComparison.every(repo => repo.forks.difference === FORK_DIFFERENCE));
});

test('daysSinceSnapshot() fetches snapshots N days apart', async t => {
	const TWO = 2;
	const snapshot = await Snapshot.create(
		{
			metrics: SAMPLE_METRICS,
			userId: t.context.userId,
			createdAt: moment().subtract(TWO, 'days'),
		},
		{
			returning: true,
		}
	);
	const snapshots = await userSnapshots(t.context.userId);
	const { latest, previous } = await daysSinceSnapshot(TWO, snapshots);
	t.is(previous.metrics.length, latest.metrics.length);
	t.is(previous.id, snapshot.id);
	t.is(previous.userId, t.context.userId);
	t.true(dateIsNDaysAgo(previous.createdAt, TWO));
	t.is(latest.id, t.context.snapshotId);
	t.is(latest.userId, t.context.userId);

	await snapshot.destroy();
});

test('subjectedSnapshot() fetches week apart snapshots', async t => {
	const WEEK_IN_DAYS = 7;
	const snapshot = await Snapshot.create(
		{
			metrics: SAMPLE_METRICS,
			userId: t.context.userId,
			createdAt: moment().subtract(WEEK_IN_DAYS, 'days'),
		},
		{
			returning: true,
		}
	);
	const snapshots = await userSnapshots(t.context.userId);
	const { latest, previous } = await subjectedSnapshot(snapshots);
	t.is(previous.metrics.length, latest.metrics.length);
	t.is(previous.id, snapshot.id);
	t.is(previous.userId, t.context.userId);
	t.true(dateIsNDaysAgo(previous.createdAt, WEEK_IN_DAYS));
	t.is(latest.id, t.context.snapshotId);
	t.is(latest.userId, t.context.userId);

	await snapshot.destroy();
});

test('fetchComparison() returns comparison of week apart snapshots', async t => {
	const WEEK_IN_DAYS = 7;
	const STAR_DIFFERENCE = 3;
	const FORK_DIFFERENCE = 10;

	const [snapshot] = await userSnapshots(t.context.userId);

	const alteredSnapshot = _.cloneDeep(snapshot);
	alteredSnapshot.metrics.map(repo => {
		repo.stars -= STAR_DIFFERENCE;
		repo.forks -= FORK_DIFFERENCE;
		return repo;
	});

	const previousSnapshot = await Snapshot.create(
		{
			metrics: alteredSnapshot.metrics,
			userId: t.context.userId,
			createdAt: moment().subtract(WEEK_IN_DAYS, 'days'),
		},
		{
			returning: true,
		}
	);

	const comparison = await fetchComparison(t.context.userId);
	t.true(comparison.length > 0);
	t.true(comparison.every(containsRepoKeys));
	t.true(comparison.every(containsComparisonKeys));
	t.true(comparison.every(repo => repo.stars.difference === STAR_DIFFERENCE));
	t.true(comparison.every(repo => repo.forks.difference === FORK_DIFFERENCE));

	await previousSnapshot.destroy();
});

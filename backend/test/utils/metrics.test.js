const test = require('ava');
const moment = require('moment');
const _ = require('lodash');
const { USER, SAMPLE_METRICS, REPOS, METRIC_TYPES } = require('../__fixtures__');
const {
	createTestUser,
	createTestSnapshot,
	destroyTestUser,
	destroyTestSnapshot,
	createSnapshot,
	setUserMetricTypes,
} = require('../helpers');
const {
	userSnapshots,
	ingest,
	fetchCurrent,
	compareSnapshots,
	daysSinceSnapshot,
	subjectedSnapshot,
	fetchComparison,
} = require('../../utils/metrics');

const WEEK_IN_DAYS = 7;

const REPO_KEYS = ['name', 'stars', 'forks', 'views', 'clones'];
const COMPARISON_KEYS = ['latest', 'difference'];

const NEW_REPO_METRICS = {
	name: 'new-repo',
	stars: 4,
	forks: 1,
	views: 12,
	clones: 0
};

const dateIsNDaysAgo = (date, days) => moment(date).add(days, 'days').isSame(moment(), 'day');

test.serial.before('create test user', createTestUser);
test.serial.before('create test snapshot', createTestSnapshot);
test.serial.after.always('destroy test user', destroyTestUser);
test.serial.after.always('destroy test snapshot', destroyTestSnapshot);

test('userSnapshots() finds user snapshots', async t => {
	const snapshots = await userSnapshots(t.context.user.id);
	t.true(snapshots.length > 0);
	t.is(snapshots[0].userId, t.context.user.id);
	t.is(snapshots[0].id, t.context.snapshot.id);
});

test('ingest() ingests metrics', async t => {
	const snapshot = await ingest(t.context.user.id);
	t.is(snapshot.userId, t.context.user.id);
	t.true(snapshot.metrics.length > 0);
	t.true(snapshot.id > t.context.snapshot.id);
	await snapshot.destroy();
});

test('fetchCurrent() fetches current metrics', async t => {
	const metrics = await fetchCurrent(t.context.user.id, USER.selectedRepos);
	t.true(Array.isArray(metrics));
	t.true(metrics.length === USER.selectedRepos.length);
	metrics.forEach(repo => t.deepEqual(Object.keys(repo), REPO_KEYS));
});

test('compareSnapshots() compares snapshots', async t => {
	const STAR_DIFFERENCE = 2;
	const FORK_DIFFERENCE = 1;
	const VIEW_DIFFERENCE = 3;
	const CLONE_DIFFERENCE = 1;

	const [snapshot] = await userSnapshots(t.context.user.id);

	const alteredSnapshot = _.cloneDeep(snapshot);
	alteredSnapshot.metrics.map(repo => {
		repo.stars += STAR_DIFFERENCE;
		repo.forks += FORK_DIFFERENCE;
		repo.views += VIEW_DIFFERENCE;
		repo.clones += CLONE_DIFFERENCE;
		return repo;
	});

	const comparison = await compareSnapshots({
		latest: _.cloneDeep(snapshot),
		previous: snapshot
	});

	t.true(comparison.length > 0);
	comparison.forEach(repo => t.deepEqual(Object.keys(repo), REPO_KEYS));
	comparison.forEach(repo => {
		t.deepEqual(Object.keys(repo), REPO_KEYS);
		Object.keys(repo).filter(key => key !== 'name').forEach(key => {
			t.deepEqual(Object.keys(repo[key]), COMPARISON_KEYS);
		});
	});

	const alteredComparison = await compareSnapshots({
		latest: alteredSnapshot,
		previous: snapshot
	});

	t.true(alteredComparison.length > 0);
	alteredComparison.forEach(repo => t.deepEqual(Object.keys(repo), REPO_KEYS));
	alteredComparison.forEach(repo => {
		t.deepEqual(Object.keys(repo), REPO_KEYS);
		Object.keys(repo).filter(key => key !== 'name').forEach(key => {
			t.deepEqual(Object.keys(repo[key]), COMPARISON_KEYS);
		});
	});
	t.true(alteredComparison.every(repo => repo.stars.difference === STAR_DIFFERENCE));
	t.true(alteredComparison.every(repo => repo.forks.difference === FORK_DIFFERENCE));
	t.true(alteredComparison.every(repo => repo.views.difference === VIEW_DIFFERENCE));
	t.true(alteredComparison.every(repo => repo.clones.difference === CLONE_DIFFERENCE));
});

test('compareSnapshots() ignores deleted repos', async t => {
	const [snapshot] = await userSnapshots(t.context.user.id);

	const alteredSnapshot = _.cloneDeep(snapshot);
	alteredSnapshot.metrics.splice(0, 1);
	alteredSnapshot.metrics.splice(-1, 1);

	const alteredComparison = await compareSnapshots({
		latest: alteredSnapshot,
		previous: snapshot
	});

	t.is(alteredComparison.length, snapshot.metrics.length - 2);
	t.deepEqual(alteredComparison.map(repo => repo.name), alteredSnapshot.metrics.map(repo => repo.name));
	alteredComparison.forEach(repo => t.deepEqual(Object.keys(repo), REPO_KEYS));
	alteredComparison.forEach(repo => {
		t.deepEqual(Object.keys(repo), REPO_KEYS);
		Object.keys(repo).filter(key => key !== 'name').forEach(key => {
			t.deepEqual(Object.keys(repo[key]), COMPARISON_KEYS);
		});
	});
});

test('compareSnapshots() ignores new repos without prior metrics', async t => {
	const [snapshot] = await userSnapshots(t.context.user.id);

	const alteredSnapshot = _.cloneDeep(snapshot);
	alteredSnapshot.metrics.push(NEW_REPO_METRICS);

	const alteredComparison = await compareSnapshots({
		latest: alteredSnapshot,
		previous: snapshot
	});

	t.is(alteredComparison.length, snapshot.metrics.length);
	t.deepEqual(alteredComparison.map(repo => repo.name), snapshot.metrics.map(repo => repo.name));
	alteredComparison.forEach(repo => t.deepEqual(Object.keys(repo), REPO_KEYS));
	alteredComparison.forEach(repo => {
		t.deepEqual(Object.keys(repo), REPO_KEYS);
		Object.keys(repo).filter(key => key !== 'name').forEach(key => {
			t.deepEqual(Object.keys(repo[key]), COMPARISON_KEYS);
		});
	});
});

test('daysSinceSnapshot() fetches snapshots N days apart', async t => {
	const TWO = 2;
	const snapshot = await createSnapshot(
		{
			metrics: SAMPLE_METRICS,
			userId: t.context.user.id,
			createdAt: moment().subtract(TWO, 'days'),
		},
		{
			returning: true,
		}
	);

	const snapshots = await userSnapshots(t.context.user.id);
	const { latest, previous } = await daysSinceSnapshot(TWO, snapshots);
	t.is(previous.metrics.length, latest.metrics.length);
	t.is(previous.id, snapshot.id);
	t.is(previous.userId, t.context.user.id);
	t.true(dateIsNDaysAgo(previous.createdAt, TWO));
	t.is(latest.id, t.context.snapshot.id);
	t.is(latest.userId, t.context.user.id);

	await snapshot.destroy();
});

test.serial('subjectedSnapshot() fetches week apart snapshots', async t => {
	const snapshot = await createSnapshot(
		{
			metrics: SAMPLE_METRICS,
			userId: t.context.user.id,
			createdAt: moment().subtract(WEEK_IN_DAYS, 'days'),
		},
		{
			returning: true,
		}
	);
	const snapshots = await userSnapshots(t.context.user.id);
	const { latest, previous } = await subjectedSnapshot(snapshots);
	t.is(previous.metrics.length, latest.metrics.length);
	t.is(previous.id, snapshot.id);
	t.is(previous.userId, t.context.user.id);
	t.true(dateIsNDaysAgo(previous.createdAt, WEEK_IN_DAYS));
	t.is(latest.id, t.context.snapshot.id);
	t.is(latest.userId, t.context.user.id);

	await snapshot.destroy();
});

test.serial('fetchComparison() returns comparison of week apart snapshots', async t => {
	const STAR_DIFFERENCE = 3;
	const FORK_DIFFERENCE = 10;
	const VIEW_DIFFERENCE = 6;
	const CLONE_DIFFERENCE = 2;

	const [snapshot] = await userSnapshots(t.context.user.id);

	const alteredSnapshot = _.cloneDeep(snapshot);
	alteredSnapshot.metrics.map(repo => {
		repo.stars -= STAR_DIFFERENCE;
		repo.forks -= FORK_DIFFERENCE;
		repo.views -= VIEW_DIFFERENCE;
		repo.clones -= CLONE_DIFFERENCE;
		return repo;
	});

	const previousSnapshot = await createSnapshot(
		{
			metrics: alteredSnapshot.metrics,
			userId: t.context.user.id,
			createdAt: moment().subtract(WEEK_IN_DAYS, 'days'),
		},
		{
			returning: true,
		}
	);

	const comparison = await fetchComparison(t.context.user.id);
	const expectedRepoNames = REPOS
		.filter(repo => repo.selected)
		.map(repo => repo.name);
	const actualRepoNames = comparison.map(repo => repo.name);
	t.deepEqual(actualRepoNames, expectedRepoNames);
	t.true(comparison.length > 0);
	comparison.forEach(repo => t.deepEqual(Object.keys(repo), REPO_KEYS));
	comparison.forEach(repo => {
		t.deepEqual(Object.keys(repo), REPO_KEYS);
		Object.keys(repo).filter(key => key !== 'name').forEach(key => {
			t.deepEqual(Object.keys(repo[key]), COMPARISON_KEYS);
		});
	});
	t.true(comparison.every(repo => repo.stars.difference === STAR_DIFFERENCE));
	t.true(comparison.every(repo => repo.forks.difference === FORK_DIFFERENCE));
	t.true(comparison.every(repo => repo.views.difference === VIEW_DIFFERENCE));
	t.true(comparison.every(repo => repo.clones.difference === CLONE_DIFFERENCE));

	await previousSnapshot.destroy();
});

test.serial('fetchComparison() returns comparison based on selected metric types', async t => {
	const [snapshot] = await userSnapshots(t.context.user.id);

	const previousSnapshot = await createSnapshot(
		{
			metrics: snapshot.metrics,
			userId: t.context.user.id,
			createdAt: moment().subtract(WEEK_IN_DAYS, 'days'),
		},
		{
			returning: true,
		}
	);

	const UNSELECTED_METRIC_TYPES = new Set(['views', 'forks']);
	const ALTERED_METRIC_TYPES = _.cloneDeep(METRIC_TYPES).map(metricType => {
		if (UNSELECTED_METRIC_TYPES.has(metricType.name)) {
			metricType.selected = false;
		}

		return metricType;
	});

	await setUserMetricTypes(t.context.user, ALTERED_METRIC_TYPES);

	const comparison = await fetchComparison(t.context.user.id);
	t.true(comparison.length > 0);

	const actualRepoNames = comparison.map(repo => repo.name);
	const expectedRepoNames = REPOS
		.filter(repo => repo.selected)
		.map(repo => repo.name);

	t.deepEqual(actualRepoNames, expectedRepoNames);

	const EXPECTED_REPO_KEYS = REPO_KEYS.filter(key => !UNSELECTED_METRIC_TYPES.has(key));
	comparison.forEach(repo => t.deepEqual(Object.keys(repo), EXPECTED_REPO_KEYS));
	comparison.forEach(repo => {
		t.deepEqual(Object.keys(repo), EXPECTED_REPO_KEYS);
		Object.keys(repo).filter(key => key !== 'name').forEach(key => {
			t.deepEqual(Object.keys(repo[key]), COMPARISON_KEYS);
		});
	});

	await previousSnapshot.destroy();
});

test.serial('fetchComparison() returns null without sufficient snapshots', async t => {
	const comparison = await fetchComparison(t.context.user.id);
	t.is(comparison, null);
});

const moment = require('moment');
const { fetchUserRepoStats } = require('./github');

const WEEK_IN_DAYS = 7;
const ZERO = 0;

const userSnapshots = async id => {
	const { Snapshot } = require('../models');
	const snapshots = await Snapshot.findAll({
		where: {
			userId: id,
		},
		order: [['createdAt', 'DESC']],
	});

	return snapshots;
};

const daysSince = date => moment(date).diff(moment(), 'days');

const daysSinceSnapshot = (days, snapshots) => {
	const [latest] = snapshots
		.filter(snapshot => daysSince(snapshot.createdAt) === ZERO);
	const [previous] = snapshots
		.filter(snapshot => daysSince(snapshot.createdAt) === -days);

	return {
		latest,
		previous,
	};
};

const subjectedSnapshot = snapshots => daysSinceSnapshot(WEEK_IN_DAYS, snapshots);

const compareSnapshots = ({ latest, previous }) => {
	return latest.metrics
		.map((_, index) => {
			let latestMetricsAtIndex = latest.metrics[index];
			const previousMetricsAtIndex = previous.metrics[index];
			Object.keys(latestMetricsAtIndex)
				.forEach(key => {
					if (key !== 'name') {
						try {
							latestMetricsAtIndex[key] = {
								latest: latestMetricsAtIndex[key],
								difference: latestMetricsAtIndex[key] - previousMetricsAtIndex[key],
							};
						} catch {
							latestMetricsAtIndex = null;
						}
					}
				});

			return latestMetricsAtIndex;
		})
		.filter(repo => repo !== null);
};

const ingest = async id => {
	const { Snapshot } = require('../models');
	const metrics = await fetchUserRepoStats(id);
	const snapshot = await Snapshot.create({
		metrics,
		userId: id,
	});
	return snapshot;
};

const fetchCurrent = async (id, selectedRepos) => {
	const metrics = await fetchUserRepoStats(id);
	return metrics
		.filter(repo => selectedRepos.includes(repo.name));
};

const fetchComparison = async id => {
	const { User } = require('../models');
	const { repos, metricTypes } = await User.findByPk(id);

	const selectedRepos = new Set(repos
		.filter(repo => repo.selected)
		.map(repo => repo.name));

	const selectedMetricTypes = new Set(metricTypes
		.filter(metricType => metricType.selected)
		.map(metricType => metricType.name));

	const snapshots = await userSnapshots(id);
	if (snapshots.length < 2) {
		return null;
	}

	const { latest, previous } = subjectedSnapshot(snapshots);
	return compareSnapshots({ latest, previous })
		.filter(repo => selectedRepos.has(repo.name))
		.map(repo => {
			Object.keys(repo).forEach(key => {
				if (!selectedMetricTypes.has(key) && key !== 'name') {
					delete repo[key];
				}
			});

			return repo;
		});
};

module.exports = {
	userSnapshots,
	ingest,
	fetchCurrent,
	compareSnapshots,
	daysSinceSnapshot,
	subjectedSnapshot,
	fetchComparison,
};

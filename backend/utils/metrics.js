const moment = require('moment');
const { Snapshot } = require('../models');
const { fetchUserRepoStats } = require('./github');

const WEEK_IN_DAYS = 7;
const ZERO = 0;

const userSnapshots = async id => {
	const snapshots = await Snapshot.findAll({
		where: {
			userId: id,
		},
		order: [['createdAt', 'DESC']],
	});

	return snapshots
		.map(snapshot => snapshot.get({ plain: true }));
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
	return (latest.metrics).map((_, index) => {
		return Object.keys(latest.metrics[index])
			.map(key => {
				latest.metrics[index][key] = {
					latest: latest.metrics[index][key],
					difference: latest.metrics[index][key] - previous.metrics[index][key],
				};
				return latest.metrics;
			});
	});
};

const ingest = async id => {
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
	const snapshots = await userSnapshots(id);
	const { latest, previous } = subjectedSnapshot(snapshots);
	return compareSnapshots({ latest, previous });
};

module.exports = {
	ingest,
	fetchCurrent,
	fetchComparison,
};

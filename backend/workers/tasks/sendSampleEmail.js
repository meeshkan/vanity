const metrics = require('../metrics');
const email = require('../email');

module.exports.handle = async function({ user }) {
    const currentMetrics = await metrics.fetchCurrent(user.id, user.selectedRepos);
	email.sendSample(currentMetrics, user);
};

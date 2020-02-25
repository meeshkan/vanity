const metrics = require('../metrics');
const email = require('../email');

module.exports.handle = async function({ user }) {
    const weekMetrics = await metrics.fetchComparison(user.id);
	email.send(weekMetrics, user);
};

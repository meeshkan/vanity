const metrics = require('../metrics');

module.exports.handle = async function({ user }) {
	metrics.ingest(user.id);
};

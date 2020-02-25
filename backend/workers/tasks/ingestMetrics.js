const metrics = require('../metrics');

module.exports.handle = function({ user }) {
	metrics.ingest(user.id);
};

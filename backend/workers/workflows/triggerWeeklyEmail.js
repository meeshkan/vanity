const { QUEUE_CRON } = require('../../config');

module.exports.handle = function*({ user }) {
    this.schedule(QUEUE_CRON.METRICS).task('ingestMetrics', user);
    this.schedule(QUEUE_CRON.EMAIL).task('sendEmail', user);
};

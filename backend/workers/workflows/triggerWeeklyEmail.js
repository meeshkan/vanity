const { QUEUE_CRON } = require('../../config');

module.exports.handle = function*({ user }) {
    this.schedule(QUEUE_CRON.EMAIL).task('sendEmail', user);
};

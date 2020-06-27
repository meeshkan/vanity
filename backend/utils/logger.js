const { createLogger, format, transports } = require('winston');
const Sentry = require('winston-transport-sentry-node').default;
const { combine, json, timestamp, simple } = format;
const { SENTRY_DSN } = require('../config');

const logger = createLogger({
	level: 'info',
	format: json(),
	transports: [
		new Sentry({
			sentry: {
				dsn: SENTRY_DSN,
			},
			level: 'info'
		}),
		new transports.Console({
			format: combine(
				timestamp({
					format: 'YYYY-MM-DD HH:mm:ss'
				}),
				simple()
			),
		})
	],
	exitOnError: false,
});

module.exports = logger;

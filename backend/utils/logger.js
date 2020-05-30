
const { join } = require('path');
const { createLogger, format, transports } = require('winston');
const { combine, json, timestamp, simple } = format;
const { NODE_ENV } = require('../config');

const logger = createLogger({
	level: 'info',
	format: json(),
	transports: [
		new transports.File({ filename: join(__dirname, '../logs/error.log'), level: 'error' }),
		new transports.File({ filename: join(__dirname, '../logs/combined.log') }),
	],
	exitOnError: false,
});

if (NODE_ENV === 'development') {
	logger.add(new transports.Console({
		format: combine(
			timestamp({
				format: 'YYYY-MM-DD HH:mm:ss'
			}),
			simple()
		),
	}));
}

module.exports = logger;

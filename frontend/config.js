const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const {
	VANITY_URI,
	SENTRY_DSN,
	NODE_ENV,
} = process.env;

module.exports = {
	VANITY_URI,
	SENTRY_DSN,
	NODE_ENV,
};

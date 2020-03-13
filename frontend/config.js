const { join } = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: join(__dirname, '../.env') });

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

const { join } = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: join(__dirname, '../../.env') });

const {
	test: TEST_DB,
	development: DEV_DB,
	production: PROD_DB
} = require('./sequelize');

const {
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GITHUB_REDIRECT_URI,
	JWT_SECRET,
	REDIS_URL,
	LOG_LEVEL,
	LOG_FILE,
	SENDGRID_API_KEY,
	SENTRY_DSN,
	NODE_ENV,
	GITHUB_USER_TOKEN,
	GITHUB_NO_INSTALLATION_USER_TOKEN,
} = process.env;

const PASSPORT_DEFAULT_OPTIONS = {
	clientID: GITHUB_CLIENT_ID,
	clientSecret: GITHUB_CLIENT_SECRET,
	callbackURL: GITHUB_REDIRECT_URI,
};

const PASSPORT_OPTIONS = {
	production: PASSPORT_DEFAULT_OPTIONS,
	development: PASSPORT_DEFAULT_OPTIONS,
	test: {
		clientID: 'GITHUB_CLIENT_ID',
		clientSecret: 'GITHUB_CLIENT_SECRET',
		callbackURL: 'GITHUB_REDIRECT_URI',
	},
};

const SENTRY_CONFIG = {
	dsn: SENTRY_DSN,
	environment: NODE_ENV,
};

const CORS_OPTIONS = {
	origin: (origin, callback) => callback(null, true),
	exposedHeaders: ['Set-Cookie'],
	credentials: true,
};

const QUEUE_CRON = {
	// METRICS: '* * * * *',
	METRICS: '0 0 * * *',
	// EMAIL: '*/2 * * * *',
	EMAIL: '0 0 * * MON',
};

const QUEUE_ATTEMPTS = {
	METRICS: 5,
	EMAIL: 5,
	SAMPLE: 5,
};

const EMAIL_CONFIG = {
	vanityAddress: 'vanity@meeshkan.com',
	intro: 'Here are your GitHub VANITY Metrics for this week.',
	sampleIntro: 'This is what your metrics newsletters will look like, minus the weekly comparison.',
	subject: 'Your VANITY metrics for this week',
	sampleSubject: 'Welcome to VANITY',
};

const SEQUELIZE_CONFIG = {
	test: TEST_DB,
	development: DEV_DB,
	production: PROD_DB,
	dialect: 'pg',
	dialectModule: require('pg'),
};

module.exports = {
	NODE_ENV,
	PASSPORT_OPTIONS,
	JWT_SECRET,
	CORS_OPTIONS,
	REDIS_URL,
	LOG_LEVEL,
	LOG_FILE,
	QUEUE_CRON,
	QUEUE_ATTEMPTS,
	SENDGRID_API_KEY,
	EMAIL_CONFIG,
	SENTRY_CONFIG,
	SEQUELIZE_CONFIG,
	GITHUB_USER_TOKEN,
	GITHUB_NO_INSTALLATION_USER_TOKEN,
};

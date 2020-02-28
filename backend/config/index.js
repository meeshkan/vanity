const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const {
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GITHUB_REDIRECT_URI,
	JWT_SECRET,
	REDIS_URL,
	LOG_LEVEL,
	LOG_FILE,
	SENDGRID_API_KEY,
	DB_USERNAME,
	DB_PASSWORD,
	DB_DATABASE,
	DB_HOST,
	DB_PORT,
	SENTRY_DSN,
	NODE_ENV
} = process.env;

const GITHUB_SCOPE = [
	'user:email',
	'repo',
];

const PASSPORT_DEFAULT_OPTIONS = {
	clientID: GITHUB_CLIENT_ID,
	clientSecret: GITHUB_CLIENT_SECRET,
	callbackURL: GITHUB_REDIRECT_URI,
	scope: GITHUB_SCOPE,
};

const PASSPORT_OPTIONS = {
	production: PASSPORT_DEFAULT_OPTIONS,
	development: PASSPORT_DEFAULT_OPTIONS,
	test: {
		clientID: 'GITHUB_CLIENT_ID',
		clientSecret: 'GITHUB_CLIENT_SECRET',
		callbackURL: 'GITHUB_REDIRECT_URI',
		scope: 'GITHUB_SCOPE',
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

const DEV_DB = {
	username: 'handler',
	password: 'password',
	database: 'sampledb',
	host: '127.0.0.1',
	port: 5432,
	dialect: 'postgres'
};

const TEST_DB = Object.assign(DEV_DB, {
	logging: false,
});

const PROD_DB = {
	username: DB_USERNAME,
	password: DB_PASSWORD,
	database: DB_DATABASE,
	host: DB_HOST,
	port: DB_PORT,
	dialect: 'postgres',
	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false,
		},
	},
};

const EMAIL_CONFIG = {
	vanityAddress: 'vanity@metrics.com',
	intro: 'Here are your GitHub Vanity Metrics for this week.',
	sampleIntro: 'This is what your metrics newsletters will look like, minus the weekly comparison.',
	subject: 'Your Vanity metrics for this week',
	sampleSubject: 'Welcome to Vanity Metrics',
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
	GITHUB_SCOPE,
	LOG_LEVEL,
	LOG_FILE,
	QUEUE_CRON,
	QUEUE_ATTEMPTS,
	SENDGRID_API_KEY,
	EMAIL_CONFIG,
	SENTRY_CONFIG,
	SEQUELIZE_CONFIG,
};

const { join } = require('path');
const dotenv = require('dotenv');
dotenv.config();

const {
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GITHUB_REDIRECT_URI,
	JWT_SECRET,
	REDIS_URL,
	LOG_LEVEL,
	LOG_FILE,
	NODE_ENV,
	SENDGRID_API_KEY,
	DB_USERNAME,
	DB_PASSWORD,
	DB_DATABASE,
	DB_HOST,
	DB_PORT,
} = process.env;

const GITHUB_SCOPE = [
	'user:email',
	'repo',
];

const PASSPORT_OPTIONS = {
	clientID: GITHUB_CLIENT_ID,
	clientSecret: GITHUB_CLIENT_SECRET,
	callbackURL: GITHUB_REDIRECT_URI,
	scope: GITHUB_SCOPE,
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

const PROD_DB = {
	username: DB_USERNAME,
	password: DB_PASSWORD,
	database: DB_DATABASE,
	host: DB_HOST,
	port: DB_PORT,
	dialect: 'postgres',
	dialectOptions: {
		ssl: true
	}
};

const EMAIL_CONFIG = {
	vanityAddress: 'vanity@metrics.com',
	intro: 'Here are your GitHub Vanity Metrics for this week.',
	sampleIntro: 'This is what your metrics newsletters will look like, minus the weekly comparison.',
	subject: 'Your Vanity metrics for this week',
	sampleSubject: 'Welcome to Vanity Metrics',
	mailgen: {
		theme: {
			path: join(__dirname, 'workers/themes/salted/index.html'),
			plaintextPath: join(__dirname, 'workers/themes/salted/index.txt'),
		},
		product: {
			name: 'Vanity Metrics',
			link: 'https://vanity-metrics.io',
			logo: 'https://www.unmock.io/img/logo.png',
		},
	},
	columnStyle: {
		customWidth: {
			statistic: '50%',
			value: '50%',
		},
		customAlignment: {
			statistic: 'left',
			value: 'right',
		},
	},
};

module.exports = {
	PASSPORT_OPTIONS,
	JWT_SECRET,
	CORS_OPTIONS,
	REDIS_URL,
	GITHUB_SCOPE,
	LOG_LEVEL,
	LOG_FILE,
	NODE_ENV,
	QUEUE_CRON,
	QUEUE_ATTEMPTS,
	SENDGRID_API_KEY,
	DEV_DB,
	PROD_DB,
	EMAIL_CONFIG,
};

const { join } = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: join(__dirname, '../../.env') });

const {
	DB_USERNAME,
	DB_PASSWORD,
	DB_DATABASE,
	DB_HOST,
	DB_PORT,
} = process.env;

const DEV_DB = {
	username: 'handler',
	password: 'password',
	database: 'sampledb',
	host: '127.0.0.1',
	port: 5432,
	dialect: 'postgres',
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

module.exports = {
	development: DEV_DB,
	test: TEST_DB,
	production: PROD_DB,
};

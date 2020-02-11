const { DEV_DB, PROD_DB, SESSION_SECRET } = require('../config');

module.exports = {
	development: DEV_DB,
	production: PROD_DB,
	session: {
		secret: SESSION_SECRET,
	},
	dialect: 'pg',
	dialectModule: require('pg'),
};

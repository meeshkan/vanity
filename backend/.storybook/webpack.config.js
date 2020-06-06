const path = require('path');

module.exports = ({ config }) => {
	config.module.rules.push({
		test: /\.ejs$/,
		loaders: ['ejs-loader'],
		include: path.resolve(__dirname, '../utils/email/templates'),
	});

	return config;
};

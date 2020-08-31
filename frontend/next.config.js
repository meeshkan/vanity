const withSourceMaps = require('@zeit/next-source-maps');
const { VANITY_URI, SENTRY_DSN, NODE_ENV } = require('./config');

module.exports = withSourceMaps({
	env: {
		VANITY_URI,
		SENTRY_DSN,
		ENV: NODE_ENV,
	},
	target: 'serverless',
	webpack: (config, options) => {
		config.node = {
			fs: 'empty',
		};

		if (!options.isServer) {
			config.resolve.alias['@sentry/node'] = '@sentry/browser';
		}

		return config;
	},
});

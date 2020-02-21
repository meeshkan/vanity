const withSourceMaps = require('@zeit/next-source-maps');
const withCSS = require('@zeit/next-css');
const { VANITY_URI, SENTRY_DSN, NODE_ENV } = require('./config');

module.exports = withSourceMaps(
	withCSS({
		env: {
			VANITY_URI,
			SENTRY_DSN,
			ENV: NODE_ENV,
		},
		target: 'serverless',
		webpack: (config, options) => {
			config.node = {
				fs: 'empty'
			};

			if (!options.isServer) {
				config.resolve.alias['@sentry/node'] = '@sentry/browser';
			}

			return config;
		}
	})
);

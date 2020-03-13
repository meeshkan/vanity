// https://github.com/zeit/next.js/blob/master/examples/with-cookie-auth/utils/get-host.js
// This is not production ready, (except with providers that ensure a secure host, like Now)
// For production consider the usage of environment variables and NODE_ENV
const getHost = req => {
	if (!req) {
		return '';
	}

	const { host } = req.headers;

	if (host.startsWith('localhost')) {
		return process.env.VANITY_URI;
	}

	return `https://${host}`;
};

export default getHost;

import React from 'react';
import NextErrorComponent from 'next/error';
import PropTypes from 'prop-types';
import * as Sentry from '@sentry/node';

const MyError = ({ statusCode, hasGetInitialPropsRun, err }) => {
	if (!hasGetInitialPropsRun && err) {
		Sentry.captureException(err);
	}

	return <NextErrorComponent statusCode={statusCode} />;
};

MyError.propTypes = {
	statusCode: PropTypes.number.isRequired,
	hasGetInitialPropsRun: PropTypes.bool.isRequired,
	err: PropTypes.object.isRequired,
};

MyError.getInitialProps = async ({ res, err, asPath }) => {
	const errorInitialProps = await NextErrorComponent.getInitialProps({ res, err });

	errorInitialProps.hasGetInitialPropsRun = true;

	if (res) {
		// Running on the server, the response object is available.
		if (res.statusCode === 404) {
			return {
				statusCode: 404
			};
		}

		if (err) {
			Sentry.captureException(err);
			return errorInitialProps;
		}
	} else {
		// Running on the client (browser).
		if (err) {
			Sentry.captureException(err);
			return errorInitialProps;
		}
	}

	// If this point is reached, getInitialProps was called without any
	// information about what the error might be. This is unexpected and may
	// indicate a bug introduced in Next.js, so record it in Sentry.
	Sentry.captureException(
		new Error(`_error.js getInitialProps missing data at path: ${asPath}`)
	);

	return errorInitialProps;
};

export default MyError;

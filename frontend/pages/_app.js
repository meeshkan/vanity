import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import * as Sentry from '@sentry/node';
import { DefaultSeo as DefaultSEO } from 'next-seo';
import { ToastContainer } from 'react-toastify';
import SEO from '../next-seo.config';
import { pageview } from '../utils/gtag';
import 'react-toastify/dist/ReactToastify.css';
import 'tachyons/css/tachyons.min.css';
import 'nprogress/nprogress.css';
import '../styles/app.css';
import '../styles/layout.css';
import '../styles/preferences.css';
import '../styles/landing.css';

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	environment: process.env.ENV,
});

Router.events.on('routeChangeComplete', url => pageview(url));

const Vanity = ({ Component, pageProps, err }) => {
	const modifiedPageProps = { ...pageProps, err };

	return (
		<>
			<DefaultSEO {...SEO} />
			<Component {...modifiedPageProps} />
			<ToastContainer
				pauseOnFocusLoss
				draggable
				pauseOnHover
				closeOnClick
				position='bottom-right'
				autoClose={4000}
				hideProgressBar={false}
				newestOnTop={false}
				rtl={false}
			/>
		</>
	);
};

Vanity.getInitialProps = async ({ Component, ctx }) => {
	let pageProps = {};
	if (Component.getInitialProps) {
		pageProps = await Component.getInitialProps(ctx);
	}

	return { pageProps };
};

Vanity.propTypes = {
	Component: PropTypes.func.isRequired,
	pageProps: PropTypes.object,
	err: PropTypes.object,
};

Vanity.defaultProps = {
	pageProps: undefined,
	err: undefined,
};

export default Vanity;

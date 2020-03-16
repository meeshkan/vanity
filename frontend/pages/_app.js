import React from 'react';
import App from 'next/app';
import Router from 'next/router';
import * as Sentry from '@sentry/node';
import { DefaultSeo as DefaultSEO } from 'next-seo';
import SEO from '../next-seo.config';
import { pageview } from '../utils/gtag';
import '../styles/app.css';

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	environment: process.env.ENV,
});

Router.events.on('routeChangeComplete', url => pageview(url));

class Vanity extends App {
	static async getInitialProps({ Component, ctx }) {
		let pageProps = {};
		if (Component.getInitialProps) {
			pageProps = await Component.getInitialProps(ctx);
		}

		return { pageProps };
	}

	render() {
		const { Component, pageProps } = this.props;

		const { err } = this.props;
		const modifiedPageProps = { ...pageProps, err };

		return (
			<>
				<DefaultSEO {...SEO} />
				<Component {...modifiedPageProps} />
			</>
		);
	}
}

export default Vanity;

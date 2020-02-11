import React from 'react';
import App from 'next/app';
import { DefaultSeo as DefaultSEO } from 'next-seo';
import SEO from '../next-seo.config';
import '../styles/app.css';

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
		return (
			<>
				<DefaultSEO {...SEO} />
				<Component {...pageProps} />
			</>
		);
	}
}

export default Vanity;

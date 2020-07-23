import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { GA_TRACKING_ID } from '../utils/gtag';

class VanityDoc extends Document {
	static async getInitialProps(ctx) {
		const initialProps = await Document.getInitialProps(ctx);
		return { ...initialProps };
	}

	render() {
		return (
			<Html lang='en'>
				<Head>
					<meta charSet='utf-8' />
					<meta name='format-detection' content='telephone=no' />
					<meta
						name='viewport'
						content='width=device-width, initial-scale=1.0'
					/>
					<link
						href='https://fonts.googleapis.com/css?family=Space+Mono'
						rel='stylesheet'
					/>
					<link
						href='https://fonts.googleapis.com/icon?family=Material+Icons'
						rel='stylesheet'
					/>
					<link
						rel='icon'
						type='image/png'
						sizes='16x16'
						href='/static/images/favicon/favicon-16x16.png'
					/>
					<link
						rel='icon'
						type='image/png'
						sizes='32x32'
						href='/static/images/favicon/favicon-32x32.png'
					/>
					<meta name='msapplication-TileColor' content='#ffffff' />
					<meta
						name='msapplication-TileImage'
						content='/static/images/favicon/ms-icon-144x144.png'
					/>
					<meta name='theme-color' content='#ffffff' />
					<script
						async
						src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
					/>
					<script
						dangerouslySetInnerHTML={{
							__html: `
								window.dataLayer = window.dataLayer || [];
								function gtag(){dataLayer.push(arguments);}
								gtag('js', new Date());
								gtag('config', '${GA_TRACKING_ID}');
							`
						}}
					/>
					<script
						dangerouslySetInnerHTML={{
							__html: `
								(function(h, o, t, j, a, r) {
									h.hj =
										h.hj ||
										function() {
											(h.hj.q = h.hj.q || []).push(arguments)
										};
									h._hjSettings = { hjid: 1731093, hjsv: 6 };
									a = o.getElementsByTagName('head')[0];
									r = o.createElement('script');
									r.async = 1;
									r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
									a.appendChild(r);
								})(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
							`
						}}
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default VanityDoc;

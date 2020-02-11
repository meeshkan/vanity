import Document, { Html, Head, Main, NextScript } from 'next/document';

class VanityDoc extends Document {
	static async getInitialProps(ctx) {
		const initialProps = await Document.getInitialProps(ctx);
		return { ...initialProps };
	}

	render() {
		return (
			<Html>
				<Head>
					<meta charSet='utf-8' />
					<meta
						name='viewport'
						content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
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

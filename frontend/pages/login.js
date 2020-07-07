import React from 'react';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import GitHubIcon from '../components/GitHubIcon';

export const Login = () => (
	<Layout>
		<main className='pa3 pa5-ns vh-100 w-100 white dt tc'>
			<div className='f4 lh-copy measure dtc v-mid'>
				<h3>access your metrics preferences</h3>
				<p>
					<a href='/auth/github' className='white dim no-underline db'>
						<span className='v-mid db mb3'>Login with GitHub</span>
						<GitHubIcon />
					</a>
				</p>
			</div>
		</main>
		<Footer />
	</Layout>
);

Login.getInitialProps = async ctx => {
	const { jwt: token } = nextCookie(ctx);

	if (token) {
		if (typeof window === 'undefined') {
			return ctx.res.writeHead(302, { Location: '/preferences' }).end();
		}

		Router.push('/preferences');
	}
};

export default Login;

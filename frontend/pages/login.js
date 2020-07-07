import React from 'react';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import Main from '../components/Main';
import GitHubIcon from '../components/GitHubIcon';

export const Login = () => (
	<Layout>
		<Main>
			<h3>access your metrics preferences</h3>
			<p>
				<a href='/auth/github' className='white dim no-underline dt center'>
					<span className='v-mid dt mb3'>Login with GitHub</span>
					<GitHubIcon />
				</a>
			</p>
		</Main>
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

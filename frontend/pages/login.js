import React from 'react';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import Layout from '../components/layout';
import Footer from '../components/footer';
import Main from '../components/main';
import LoginButton from '../components/login-button';

export const Login = () => (
	<Layout title="Login | Vanity">
		<Main>
			<h3>access your metrics preferences</h3>
			<LoginButton />
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

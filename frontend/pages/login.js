import React from 'react';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import Main from '../components/Main';
import LoginButton from '../components/LoginButton';

export const Login = () => (
	<Layout title='Login | Vanity'>
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

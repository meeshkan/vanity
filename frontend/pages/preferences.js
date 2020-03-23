import React from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-unfetch';
import nextCookie from 'next-cookies';
import Cookies from 'js-cookie';
import moment from 'moment';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import Repos from '../components/Repos';
import { withAuthSync } from '../utils/auth';
import getHost from '../utils/get-host';
import { cookies, logout } from '../logic/preferences';
import "react-toggle/style.css";

export const Preferences = props => {
	const { username, repos, token } = props;

	return (
		<Layout>
			<main className='pa3 pa5-ns vh-100 w-100 white dt tc'>
				<div className='f4 measure dtc v-mid'>
					<h2>preferences</h2>
					<p className='pb4'>
						welcome, {username}
					</p>
					<p>
						upcoming metrics email:
						<div className='avenir pa3'>
							{moment().startOf('day').add(9, 'hours').day(8).toString()}
						</div>
					</p>
					{(repos && repos.length > 0) ?
						<Repos repos={repos} token={token} /> : (
							<>
								<p>It seems like you don&apos;t have any repos.</p>
								<p>Come back once you&apos;ve made some.</p>
							</>
						)}
					<br />
					<div className='pv4'>
						<a
							className='link dim f5 link dim ph3 pv2 mb2 dib white bg-blue'
							onClick={logout}
						>
							logout
						</a>
					</div>
				</div>
			</main>
			<Footer />
		</Layout>
	);
};

Preferences.propTypes = {
	username: PropTypes.string.isRequired,
	repos: PropTypes.array.isRequired,
	token: PropTypes.string.isRequired,
};

Preferences.getInitialProps = async ctx => {
	const { jwt: token } = nextCookie(ctx);
	const apiURL = `${getHost(ctx.req) || ''}/api/preferences`;

	const redirectOnError = () => {
		cookies.forEach(cookie => Cookies.remove(cookie));
		if (typeof window === 'undefined') {
			ctx.res.writeHead(302, { Location: '/login' }).end();
		} else {
			Router.push('/login');
		}
	};

	try {
		const response = await fetch(apiURL, {
			credentials: 'include',
			headers: {
				authorization: JSON.stringify({ token }),
			},
		});

		if (response.ok) {
			const user = await response.json();
			user.token = token;
			return user;
		}

		return await redirectOnError();
	} catch (error) {
		console.error(error); // TODO: handle error
		return redirectOnError();
	}
};

export default withAuthSync(Preferences);

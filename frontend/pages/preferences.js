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
import MetricTypes from '../components/MetricTypes';
import { withAuthSync } from '../utils/auth';
import getHost from '../utils/get-host';
import { cookies, logout } from '../logic/preferences';
import '../styles/preferences.css';

export const Preferences = props => {
	const { username, repos, metricTypes, token, isAppInstalled } = props;

	return (
		<Layout>
			<main className='pa3 pa5-ns vh-100 w-100 white dt tc'>
				<div className='f4 measure pt3 dtc v-mid'>
					<h2>preferences</h2>
					<p className='pb4'>
						welcome, {username}
					</p>
					<p>
						upcoming metrics email:<br/>
						<span className='avenir pv3 dib'>
							{moment().startOf('day').add(9, 'hours').day(8).toString()}
						</span>
					</p>
					<hr />
					<MetricTypes metricTypes={metricTypes} token={token} />
					{isAppInstalled ? <br /> : (
						<span className='avenir pv3 dib lh-copy'>
							If you&apos;d like to receive repo <i>views</i> and <i>clones</i>,
							{' '}
							<br/>please <a href='https://github.com/apps/vanity-dev/installations/new' className='no-underline blue dim'>install the VANITY GitHub App</a>.
						</span>
					)}
					<hr />
					{(repos && repos.length > 0) ?
						<Repos repos={repos} token={token} /> : (
							<>
								<p>It seems like you don&apos;t have any repos.</p>
								<p>Come back once you&apos;ve made some.</p>
							</>
						)}
					<br />
					<hr />
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
	metricTypes: PropTypes.array.isRequired,
	isAppInstalled: PropTypes.bool.isRequired,
	token: PropTypes.string.isRequired,
};

Preferences.getInitialProps = async ctx => {
	const { jwt: token } = nextCookie(ctx);
	const url = `${getHost(ctx.req) || ''}/api/preferences`;

	const redirectOnError = () => {
		cookies.forEach(cookie => Cookies.remove(cookie));
		if (typeof window === 'undefined') {
			return ctx.res.writeHead(302, { Location: '/login' }).end();
		}

		Router.push('/login');
	};

	try {
		const response = await fetch(url, {
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

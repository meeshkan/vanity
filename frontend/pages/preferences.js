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
import { COOKIES, logout } from '../logic/preferences';

export const Preferences = ({ username, repos, metricTypes, token, isAppInstalled }) => (
	<Layout>
		<main className='pa3 pa5-ns vh-100 w-100 white dt tc'>
			<div className='f4 measure pt5 pt3-ns dtc v-mid'>
				<h2>preferences</h2>
				<p className='pb4'>
					welcome, {username}
				</p>
				<p className='f5 f4-ns lh-copy'>
					<span className='db'>
						upcoming metrics email:
					</span>
					<span className='avenir pv3 dib i'>
						{moment().startOf('day').add(9, 'hours').day(8).toString()}
					</span>
				</p>
				<hr className='w-100 w-70-ns' />
				<MetricTypes metricTypes={metricTypes} token={token} />
				<div className='pv3'>
					{isAppInstalled ? (null) : (
						<span className='avenir dib lh-copy'>
							<span className='db'>If you&apos;d like to receive repo <em>views</em> and <em>clones</em>,</span>
							{' '}
							please <a href='https://github.com/apps/vanity-dev/installations/new' className='no-underline blue dim'>install the VANITY GitHub App</a>.
						</span>
					)}
				</div>
				<hr className='w-100 w-70-ns' />
				{(repos && repos.length > 0) ?
					<div className='pb4'>
						<Repos repos={repos} token={token} />
					</div> : (
						<>
							<p>It seems like you don&apos;t have any repos.</p>
							<p>Come back once you&apos;ve made some.</p>
						</>
					)}
				<hr className='w-100 w-70-ns' />
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
		COOKIES.forEach(cookie => Cookies.remove(cookie));
		if (typeof window === 'undefined') {
			return ctx.res.writeHead(302, { Location: '/login' }).end();
		}

		Router.push('/login');
	};

	try {
		const response = await fetch(url, {
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
		console.error(error);
		return redirectOnError();
	}
};

export default withAuthSync(Preferences);

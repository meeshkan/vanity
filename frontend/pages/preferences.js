import React, { useState } from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-unfetch';
import nextCookie from 'next-cookies';
import NProgress from 'nprogress';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import Main from '../components/Main';
import Repos from '../components/Repos';
import MetricTypes from '../components/MetricTypes';
import AccountDeleted from '../components/AccountDeleted';
import { withAuthSync } from '../utils/auth';
import getHost from '../utils/get-host';
import {
	clearCookies,
	logout,
	resubscribe,
	deleteAccount,
} from '../logic/preferences';

export const Preferences = ({ username, repos, metricTypes, token, isAppInstalled, upcomingEmailDate }) => {
	const [accountDeleted, setAccountDeleted] = useState(false);

	const handleResubscribe = () => resubscribe(token);
	const handleDeleteAccount = async () => {
		NProgress.start();

		const deleted = await deleteAccount(token);
		if (deleted) {
			setAccountDeleted(true);
			clearCookies();
		}

		NProgress.done();
	};

	if (accountDeleted) {
		return <AccountDeleted token={token} />;
	}

	return (
		<Layout>
			<Main>
				<h2 className='pt5 pt3-ns'>preferences</h2>
				<p className='pb4'>
					welcome, {username}
				</p>
				<p className='f5 f4-ns lh-copy'>
					{upcomingEmailDate ? (
						<>
							<span className='db'>
								upcoming metrics email:
							</span>
							<span className='avenir pv3 dib i'>{upcomingEmailDate}</span>
						</>
					) : (
						<>
							<span className='avenir db i'>You have been unsubscribed.</span>
							<span className='db'>
								<a
									className='link f5 ph3 pv2 ma2 dib white ba bw1 b--blue br2 bg-blue bg-animate hover-bg-transparent hover-blue'
									onClick={handleResubscribe}
								>
									re-subscribe
								</a>
								<a
									className='link f5 ph3 pv2 ma2 dib white ba bw1 b--red br2 bg-red bg-animate hover-bg-transparent hover-red'
									onClick={handleDeleteAccount}
								>
									delete account
								</a>
							</span>
						</>
					)}
				</p>
				<div className='bt bw1 w-100 w-80-ns center'>
					<MetricTypes metricTypes={metricTypes} token={token} />
					<div className='pv3'>
						{isAppInstalled ? (null) : (
							<span className='avenir dib lh-copy f5 f4-ns'>
								<span className='db'>If you&apos;d like to receive repo <em>views</em> and <em>clones</em>,</span>
								{' '}
								please <a href='https://github.com/apps/vanity-dev/installations/new' className='no-underline blue dim'>install the Vanity GitHub App</a>.
							</span>
						)}
					</div>
				</div>
				<div className='bt bw1 w-100 w-80-ns center'>
					{(repos && repos.length > 0) ? (
						<div className='pb4'>
							<Repos repos={repos} token={token} />
						</div>
					) : (
						<div className='f5 f4-ns'>
							<p>It seems like you don&apos;t have any repos.</p>
							<p>Come back once you&apos;ve made some.</p>
						</div>
					)}
				</div>
				<div className='pv4 bt bw1 w-100 w-80-ns center'>
					<a
						className='link f5 ph3 pv2 mb2 dib white ba bw1 b--blue br2 bg-blue bg-animate hover-bg-transparent hover-blue'
						onClick={logout}
					>
						logout
					</a>
				</div>
			</Main>
			<Footer />
		</Layout>
	);
};

Preferences.defaultProps = {
	upcomingEmailDate: undefined,
};

Preferences.propTypes = {
	username: PropTypes.string.isRequired,
	repos: PropTypes.array.isRequired,
	metricTypes: PropTypes.array.isRequired,
	isAppInstalled: PropTypes.bool.isRequired,
	token: PropTypes.string.isRequired,
	upcomingEmailDate: PropTypes.string
};

Preferences.getInitialProps = async ctx => {
	const { jwt: token } = nextCookie(ctx);
	const url = `${getHost(ctx.req) || ''}/api/preferences`;

	const redirectOnError = () => {
		clearCookies();
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

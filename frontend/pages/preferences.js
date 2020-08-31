import React, { useState } from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-unfetch';
import nextCookie from 'next-cookies';
import NProgress from 'nprogress';
import Layout from '../components/layout';
import Footer from '../components/footer';
import Main from '../components/main';
import Repos from '../components/repos';
import MetricTypes from '../components/metric-types';
import AccountDeleted from '../components/account-deleted';
import Button from '../components/button';
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
		<Layout title="Preferences | Vanity">
			<Main>
				<h2 className="pt5 pt3-ns">preferences</h2>
				<p className="pb4">
					welcome, {username}
				</p>
				<p className="f5 f4-ns lh-copy">
					{upcomingEmailDate ? (
						<>
							<span className="db">
								upcoming metrics email:
							</span>
							<span className="avenir pv3 dib i">{upcomingEmailDate}</span>
						</>
					) : (
						<>
							<span className="avenir db i">You have been unsubscribed.</span>
							<span className="db ma2">
								<Button
									color="blue"
									onClick={handleResubscribe}
								>
									re-subscribe
								</Button>
								<Button
									color="red"
									onClick={handleDeleteAccount}
								>
									delete account
								</Button>
							</span>
						</>
					)}
				</p>
				<div className="bt bw1 w-100 w-80-ns center">
					<MetricTypes metricTypes={metricTypes} token={token} />
					<div className="pv3">
						{isAppInstalled ? (null) : (
							<span className="avenir dib lh-copy f5 f4-ns">
								<span className="db">If you&apos;d like to receive repo <em>views</em> and <em>clones</em>,</span>
								{' '}
								please <a href="https://github.com/apps/vanity-dev/installations/new" className="no-underline blue dim">install the Vanity GitHub App</a>.
							</span>
						)}
					</div>
				</div>
				<div className="bt bw1 w-100 w-80-ns center">
					{(repos && repos.length > 0) ? (
						<div className="pb4">
							<Repos repos={repos} token={token} />
						</div>
					) : (
						<div className="f5 f4-ns">
							<p>It seems like you don&apos;t have any repos.</p>
							<p>Come back once you&apos;ve made some.</p>
						</div>
					)}
				</div>
				<div className="pv4 bt bw1 w-100 w-80-ns center">
					<Button
						color="blue"
						onClick={logout}
					>
						logout
					</Button>
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

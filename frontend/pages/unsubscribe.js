import React, { useState } from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-unfetch';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import Main from '../components/Main';
import SuccessIcon from '../components/SuccessIcon';
import UnsuccessIcon from '../components/UnsuccessIcon';
import AccountDeleted from '../components/AccountDeleted';
import getHost from '../utils/get-host';
import toastOptions from '../utils/toast';
import {
	clearCookies,
	resubscribe,
	deleteAccount,
} from '../logic/preferences';

export const Unsubscribe = ({ message, email, token }) => {
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
		<Layout title='Unsubscribe | Vanity'>
			<Main>
				{email ? (
					<>
						<SuccessIcon />
						<h3><span className='courier bg-white black pa1'>{email}</span> successfully unsubscribed</h3>
						<p>You will no longer be receiving Vanity emails</p>
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
				) : (
					<>
						<UnsuccessIcon />
						<h3>unsubscription failed</h3>
						<p>{message}</p>
					</>
				)}
			</Main>
			<Footer />
		</Layout>
	);
};

Unsubscribe.propTypes = {
	message: PropTypes.string,
	email: PropTypes.string,
	token: PropTypes.string.isRequired,
};

Unsubscribe.defaultProps = {
	message: undefined,
	email: undefined,
};

Unsubscribe.getInitialProps = async ({ req, res, query }) => {
	const url = `${getHost(req) || ''}/api/subscription`;
	const { token, email } = query;

	if (!token && !email) {
		if (typeof window === 'undefined') {
			return res.writeHead(302, { Location: '/' }).end();
		}

		Router.push('/');
	}

	try {
		const response = await fetch(url, {
			method: 'DELETE',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ token, email }),
		});

		const { error, user } = await response.json();

		if (response.ok) {
			return { ...user, token };
		}

		if (error) {
			const { message } = error;
			return { message };
		}
	} catch (error) {
		console.error(error);
		toast.error('Something went wrong. Please try refreshing the page.', toastOptions.error);
	}
};

export default Unsubscribe;

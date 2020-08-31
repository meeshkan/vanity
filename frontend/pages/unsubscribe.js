import React, { useState } from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-unfetch';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import Layout from '../components/layout';
import Footer from '../components/footer';
import Main from '../components/main';
import Button from '../components/button';
import SuccessIcon from '../components/success-icon';
import UnsuccessIcon from '../components/unsuccess-icon';
import AccountDeleted from '../components/account-deleted';
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
		<Layout title="Unsubscribe | Vanity">
			<Main>
				{email ? (
					<>
						<SuccessIcon />
						<h3><span className="courier bg-white black pa1">{email}</span> successfully unsubscribed</h3>
						<p>You will no longer be receiving Vanity emails</p>
						<span className="db">
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
				'Content-Type': 'application/json',
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

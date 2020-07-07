import React from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-unfetch';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import SuccessIcon from '../components/SuccessIcon';
import UnsuccessIcon from '../components/UnsuccessIcon';
import getHost from '../utils/get-host';

export const Unsubscribe = ({ message, email }) => (
	<Layout>
		<main className='pa3 pa5-ns vh-100 w-100 white dt tc'>
			<div className='f4 lh-copy measure dtc v-mid'>
				{email ?
					<>
						<SuccessIcon />
						<h3><span className='courier bg-white black pa1'>{email}</span> successfully unsubscribed</h3>
						<p>You will no longer be receiving Vanity emails</p>
					</> :
					<>
						<UnsuccessIcon />
						<h3>unsubscription failed</h3>
						<p>{message}</p>
					</>}
			</div>
		</main>
		<Footer />
	</Layout>
);

Unsubscribe.propTypes = {
	message: PropTypes.string,
	email: PropTypes.string,
};

Unsubscribe.defaultProps = {
	message: undefined,
	email: undefined,
};

Unsubscribe.getInitialProps = async ({ req, res, query }) => {
	const url = `${getHost(req) || ''}/api/unsubscribe`;
	const { token, email } = query;

	if (!token && !email) {
		if (typeof window === 'undefined') {
			return res.writeHead(302, { Location: '/' }).end();
		}

		Router.push('/');
	}

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ token, email }),
		});

		const { errors, user } = await response.json();

		if (response.ok) {
			return user;
		}

		if (errors) {
			const { message } = errors;
			return { message };
		}
	} catch (error) {
		console.error(error);
		toast.error('Something went wrong. Please try refreshing the page.');
	}
};

export default Unsubscribe;

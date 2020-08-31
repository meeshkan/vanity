import React, { useState } from 'react';
import PropTypes from 'prop-types';
import NProgress from 'nprogress';
import Layout from './layout';
import Main from './main';
import Footer from './footer';
import Button from './button';
import { cancelAccountDeletion } from '../logic/preferences';

const TEN_MINUTES_IN_MILLISECONDS = 10 * 60 * 1000;
const TIME_LEFT_TO_RECOVER = TEN_MINUTES_IN_MILLISECONDS;

const AccountDeleted = ({ token }) => {
	const [canRecover, setCanRecover] = useState(true);

	const handleCancellation = async () => {
		NProgress.start();
		await cancelAccountDeletion(token);
		NProgress.done();
	};

	setTimeout(() => {
		setCanRecover(false);
	}, TIME_LEFT_TO_RECOVER);

	return (
		<Layout>
			<Main>
				{canRecover ? (
					<>
						<h3>your account has been scheduled for deletion</h3>
						<p>We are sorry to see you go!</p>
						<Button
							onClick={handleCancellation}
						>
							undo
						</Button>
					</>
				) : (
					<>
						<h3>your account has been deleted</h3>
						<p>We are sorry to see you go!</p>
					</>
				)}
			</Main>
			<Footer />
		</Layout>
	);
};

AccountDeleted.propTypes = {
	token: PropTypes.string.isRequired,
};

export default AccountDeleted;

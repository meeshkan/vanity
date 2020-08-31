import React, { useState, useEffect } from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import Button from './button';
import LoginButton from './login-button';
import Footer from './footer';

const Page = ({ children }) => (
	<div className="landing-item relative slide">
		{children}
	</div>
);

Page.propTypes = {
	children: PropTypes.node.isRequired,
};

const Landing = () => {
	const [username, setUsername] = useState('');

	useEffect(() => {
		const githubUserCookie = Cookies.get('github-user');
		if (githubUserCookie) {
			const { username } = JSON.parse(
				decodeURIComponent(githubUserCookie)
			);
			setUsername(username);
		}
	}, []);

	return (
		<div className="landing-container">
			<Page>
				<div className="absolute w-100 vh-100">
					<article className="vh-100 dt w-100">
						<div className="dtc v-mid tc white ph3 ph4-l">
							<h2
								className="f2 f1-ns fw6 tc ttu f-subheadline-l mt0 mb3 relative"
								style={{ letterSpacing: '0.5em', left: '0.25em' }}
							>
								Vanity
							</h2>
							<p className="i f5 tracked-mega-l ph4 lh-copy">weekly metrics for your GitHub repos</p>
							<div className="f6 f5-l pv3 v-mid">
								{username ? (
									<>
										<h3>hey, {username}</h3>
										<p>
											<Button onClick={() => Router.push('/preferences')}>
												edit your preferences
											</Button>
										</p>
									</>
								) : (
									<>
										<h3>start receiving your metrics</h3>
										<LoginButton />
									</>
								)}
							</div>
						</div>
					</article>
				</div>
			</Page>
			<Footer />
		</div>
	);
};

export default Landing;

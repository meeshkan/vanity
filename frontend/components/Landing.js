import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import Footer from './Footer';
import GitHubIcon from './GitHubIcon';

const Page = ({ children }) => (
	<div className='landing-item relative slide'>
		{children}
	</div>
);

Page.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.array,
	]).isRequired,
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
		<div>
			<div className='landing-container'>
				<Page>
					<div className='absolute w-100 vh-100'>
						<article className='vh-100 dt w-100'>
							<div className='dtc v-mid tc white ph3 ph4-l'>
								<h2 className='f2 f1-ns fw6 tc ttu f-subheadline-l mt0 mb3'>
									V A N I T Y
								</h2>
								<p className='i f5 tracked-mega-l ph4 lh-copy'>weekly metrics for your GitHub repos</p>
								<div className='f6 f5-l pv3 v-mid'>
									{username ? (
										<>
											<h3>hey, {username}</h3>
											<p>
												<Link href='/preferences'>
													<a className='link f5 ph3 pv2 dib black ba bw1 b--white br2 bg-white bg-animate hover-bg-transparent hover-white'>
														edit your preferences
													</a>
												</Link>
											</p>
										</>
									) : (
										<>
											<h3>start receiving your metrics</h3>
											<p>
												<Link href='/auth/github'>
													<a className='white dim no-underline dt center'>
														<span className='v-mid dt mb3'>Login with GitHub</span>
														<GitHubIcon />
													</a>
												</Link>
											</p>
										</>
									)}
								</div>
							</div>
						</article>
					</div>
				</Page>
				<Footer />
			</div>
		</div>
	);
};

export default Landing;

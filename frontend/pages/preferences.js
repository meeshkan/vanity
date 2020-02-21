import React from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-unfetch';
import nextCookie from 'next-cookies';
import Cookies from 'js-cookie';
import moment from 'moment';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import { withAuthSync } from '../utils/auth';

const cookies = ['github-user', 'jwt'];

const Preferences = props => {
	const { username, repos, token } = props;

	function logout() {
		cookies.forEach(cookie => Cookies.remove(cookie));
		Router.push('/auth/logout');
	}

	async function updateRepos() {
		try {
			const response = await fetch('/api/preferences', {
				method: 'POST',
				credentials: 'include',
				headers: {
					authorization: JSON.stringify({ token }),
					'content-type': 'application/json',
				},
				body: JSON.stringify({ repos }),
			});

			if (response.ok) {
				Router.push('/preferences');
			}
		} catch (error) {
			console.log(error); // TODO: handle error
		}
	}

	function handleToggle(event, repoName, index) {
		repos[index].selected = event.target.checked;
		updateRepos();
	}

	return (
		<Layout>
			<main className='pa3 pa5-ns vh-100 w-100 white dt tc'>
				<div className='f4 measure dtc v-mid'>
					<h2>preferences</h2>
					<p className='pb4'>
						welcome, {username}
					</p>
					<p>
						upcoming metrics email:
						<div className='avenir pa3'>
							{moment().startOf('day').add(9, 'hours').day(8).toString()}
						</div>
					</p>
					<p>choose the repos you want to receive metrics for:</p>
					<div className='overflow-auto'>
						<table className='f5 center' cellSpacing='0'>
							<tbody className='lh-copy'>
								{/* TODO: Fix occasional "TypeError: Cannot read property 'map' of null" error */ }
								{/* TODO: Show small message when hovering over fork symbol */}
								{repos.map((repo, index) => (
									<tr key={repo.name}>
										<th className='fw3 bb b--white-20 tl pb3 pr6 pv3'>
											{repo.name}{repo.fork &&
												<i className='material-icons md-18 light-blue'>
													call_split
												</i>}
										</th>
										<th className='bb b--white-20 tr pb3 pv3'>
											<input
												type='checkbox'
												name={index}
												checked={repo.selected}
												className='checkbox'
												onChange={event => handleToggle(event, repo.name, index)}
											/>
										</th>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<br />
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
	token: PropTypes.string.isRequired,
};

Preferences.getInitialProps = async ctx => {
	const { jwt: token } = nextCookie(ctx);
	const apiURL = `${process.env.VANITY_URI || ''}/api/preferences`;

	const redirectOnError = () => {
		cookies.forEach(cookie => Cookies.remove(cookie));
		if (typeof window === 'undefined') {
			ctx.res.writeHead(302, { Location: '/login' }).end();
		} else {
			Router.push('/login');
		}
	};

	try {
		const response = await fetch(apiURL, {
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

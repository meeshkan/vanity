import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Router from 'next/router';
import Cookies from 'js-cookie';
import NProgress from 'nprogress';
import { version } from '../../package.json';

NProgress.configure({ showSpinner: false });
Router.onRouteChangeStart = () => NProgress.start();
Router.onRouteChangeComplete = () => NProgress.done();
Router.onRouteChangeError = () => NProgress.done();

const Nav = () => {
	const [router, setRouter] = useState('');
	const [avatarURL, setAvatarURL] = useState('');

	const [navBackground, setNavBackground] = useState(false);
	const navRef = useRef();
	navRef.current = navBackground;

	useEffect(() => {
		if (Router.router) {
			setRouter(Router.router.pathname);
		}

		const githubUserCookie = Cookies.get('github-user');
		if (githubUserCookie) {
			const { avatar } = JSON.parse(
				decodeURIComponent(githubUserCookie)
			);
			setAvatarURL(avatar);
		}

		const handleScroll = () => {
			const show = window.scrollY > 25;
			if (navRef.current !== show) {
				setNavBackground(show);
			}
		};

		document.addEventListener('scroll', handleScroll);
		return () => document.removeEventListener('scroll', handleScroll);
	}, []);

	const backgroundColor = navBackground ? 'white' : 'transparent';
	const color = navBackground ? 'black' : 'white';

	return (
		<div
			className='fixed w-100 ph3 pv3 pv3-ns ph3-m ph4-l z-9999'
			style={{ backgroundColor, transition: '1s ease' }}
		>
			<header>
				<nav className='f6 fw6 ttu tracked dt w-100 mw8 center lh-solid'>
					<div className='w-50 dtc tl v-mid'>
						<Link href='/'>
							<a className={`link dim ${color} dib mr2 mr3-l`} title='Home'>
								Vanity
							</a>
						</Link>
						<a
							href='https://github.com/meeshkan/vanity/releases'
							className={`f7 fw5 code link ph2 pv2 dib ba ${color} b--${color}-40 br2 bg-animate bg-transparent hover-bg-${color}-10 ttl tracked-tight tracked-ns`}
						>
							v{version}
						</a>
					</div>
					<div className='w-50 dtc tr v-mid'>
						<a
							className={`link dim ${color} dib mr2 mr3-l v-mid`}
							href='https://github.com/meeshkan/vanity'
							target='_blank'
							rel='noopener noreferrer'
							title='source'
						>
							Source
						</a>
						{avatarURL ? (
							<Link href='/preferences'>
								<a
									className={`link grow-large ${color} dib`}
									aria-label='preferences'
								>
									<img
										alt=''
										className='link dib v-mid'
										src={avatarURL}
										style={{ height: '20px', borderRadius: 100 }}
									/>
								</a>
							</Link>
						) : (
							<Link href='/login'>
								<a
									className={`link grow-large ${color} dib v-mid ${
										router === '/login' ? 'bb' : ''
									}`}
									title='Login'
									aria-label='login'
								>
									<i className='material-icons md-18'>person</i>
								</a>
							</Link>
						)}
					</div>
				</nav>
			</header>
		</div>
	);
};

export default Nav;

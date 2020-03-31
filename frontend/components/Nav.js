import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Router from 'next/router';
import Cookies from 'js-cookie';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false });
Router.onRouteChangeStart = () => NProgress.start();
Router.onRouteChangeComplete = () => NProgress.done();
Router.onRouteChangeError = () => NProgress.done();

export default function Nav() {
	const [router, setRouter] = useState('');
	const [avatarURL, setAvatarURL] = useState('');

	const [navBackground, setNavBackground] = useState(false);
	const navRef = useRef();
	navRef.current = navBackground;

	useEffect(() => {
		if (Router.router) {
			setRouter(Router.router.pathname);
		}

		if (Cookies.get('github-user')) {
			const { avatar } = JSON.parse(
				decodeURIComponent(Cookies.get('github-user'))
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
			className='fixed w-100 ph3 pv3 pv3-ns ph3-m ph4-l fixed z-9999'
			style={{ backgroundColor, transition: '1s ease' }}
		>
			<header>
				<nav className='f6 fw6 ttu tracked dt-l w-100 mw8 center'>
					<div className='w-100 w-10-l dtc-l tc tl-l v-mid'>
						<Link href='/'>
							<a className={`link dim ${color} dib mr3`} title='Home'>
								Vanity
							</a>
						</Link>
					</div>
					<div className='w-100 w-90-l dtc-l tc tr-l v-mid'>
						<a
							className={`link dim ${color} dib mr3 v-mid`}
							href='https://github.com/meeshkan/vanity'
							target='_blank'
							rel='noopener noreferrer'
							title='source'
						>
							Source
						</a>
						{avatarURL ? (
							<Link href='/preferences'>
								<a className={`link dim ${color} dib`}>
									<img
										className='link dim dib v-mid'
										src={avatarURL}
										style={{ height: '20px', borderRadius: 100 }}
									/>
								</a>
							</Link>
						) : (
							<Link href='/login'>
								<a
									className={`link dim ${color} dib v-mid ${
										router === '/login' ? 'bb' : ''
									}`}
									title='Login'
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
}

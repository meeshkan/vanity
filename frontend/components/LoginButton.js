import React from 'react';
import Router from 'next/router';
import Button from './Button';
import GitHubIcon from './GitHubIcon';

const LoginButton = props => (
	<Button
		onClick={() => Router.push('/auth/github')}
		{...props}
	>
		<div className='f7 inline-flex items-center v-mid'>
			<GitHubIcon />
			<span className='f6 f5-l pl2'>login with GitHub</span>
		</div>
	</Button>
);

export default LoginButton;

import React from 'react';
import TwitterIcon from './twitter-icon';
import GitHubIcon from './github-icon';
import MeeshkanIcon from './meeshkan-icon';

const Footer = () => (
	<footer className="tc bg-center pb2 w-100 relative bg-white">
		<div className="w-100 ph3 pv4">
			<a
				className="link black bg-transparent dim inline-flex items-center ma2 tc br2 pa2"
				href="https://twitter.com/meeshkan"
				title="Twitter"
			>
				<TwitterIcon dark />
				<span className="f6 ml3 pr2">Twitter</span>
			</a>
			<a
				className="link black bg-transparent dim inline-flex items-center ma2 tc br2 pa2"
				href="https://github.com/meeshkan"
				title="GitHub"
			>
				<GitHubIcon dark />
				<span className="f6 ml3 pr2">GitHub</span>
			</a>
			<span className="db">
				<a
					className="link black dim inline-flex items-center ma2 tc br2 pa2"
					href="http://meeshkan.com/"
					title="Meeshkan"
				>
					<MeeshkanIcon dark />
					<span className="f6 ml3 pr2">Meeshkan</span>
				</a>
			</span>
		</div>
	</footer>
);

export default Footer;

import React from 'react';
import { NextSeo } from 'next-seo';
import PropTypes from 'prop-types';
import Nav from './Nav';

const Layout = ({ children, title }) => (
	<div>
		<NextSeo
			title={title}
			openGraph={{ title }}
		/>
		<Nav/>
		<div key='container' data-scrollbar className='container'>
			{children}
		</div>
	</div>
);

Layout.defaultProps = {
	title: 'Vanity',
};

Layout.propTypes = {
	children: PropTypes.node.isRequired,
	title: PropTypes.string,
};

export default Layout;

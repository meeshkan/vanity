import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import Nav from './Nav';

const Layout = ({ children, title }) => (
	<div>
		<Head>
			<title>{title}</title>
		</Head>
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

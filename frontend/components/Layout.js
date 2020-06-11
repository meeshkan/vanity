import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import Nav from './Nav';
import 'tachyons/css/tachyons.min.css';
import '../styles/layout.css';

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
	children: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.array,
	]).isRequired,
	title: PropTypes.string,
};

export default Layout;

import React, { Component } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import Nav from './Nav';
import 'tachyons/css/tachyons.min.css';
import '../styles/layout.css';

export default class Layout extends Component {
	static defaultProps = {
		title: 'Vanity',
	};

	static propTypes = {
		children: PropTypes.oneOfType([
			PropTypes.object,
			PropTypes.array,
		]).isRequired,
		title: PropTypes.string,
	};

	render() {
		const { children, title } = this.props;
		return (
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
	}
}

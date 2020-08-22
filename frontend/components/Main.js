import React from 'react';
import PropTypes from 'prop-types';

const Main = ({ children }) => (
	<main className='pa3 pa5-ns vh-100 w-100 white dt tc'>
		<div className='f4 measure dtc v-mid lh-copy'>
			{children}
		</div>
	</main>
);

Main.propTypes = {
	children: PropTypes.node.isRequired,
};

export default Main;

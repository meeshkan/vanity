import React from 'react';
import PropTypes from 'prop-types';

const SuccessIcon = ({ dark = false }) => (
	<svg
		viewBox='0 0 164 164'
		xmlns='http://www.w3.org/2000/svg'
		height='100px'
		width='100px'
		fill={dark ? '#000' : '#fff'}
	>
		<title>Success Icon</title>
		<path d='M2.653,77.2C-8.051,60.834,16.396,45.005,27.1,61.368l31.825,48.519l77.66-89.438  c12.769-14.758,36.169,4.681,23.399,19.441L70.971,143.477c-6.153,8.111-18.177,7.353-23.849-1.319L2.653,77.2z' />
	</svg>
);

SuccessIcon.defaultProps = {
	dark: false,
};

SuccessIcon.propTypes = {
	dark: PropTypes.bool,
};

export default SuccessIcon;

import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ children, color, ...props }) => (
	<a
		className={`link f6 f5-l ph3 pv2 ma2 dib black ba bw1 b--${color} br2 bg-${color} bg-animate hover-bg-transparent hover-${color} fill-black fill-white-hover`}
		{...props}
	>
		{children}
	</a>
);

Button.defaultProps = {
    color: 'white',
};

Button.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.array,
	]).isRequired,
    color: PropTypes.string,
};

export default Button;

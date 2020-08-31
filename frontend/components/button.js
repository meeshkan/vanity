import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Button = ({ children, color, onClick, ...props }) => {
	const [loading, setLoading] = useState(false);

	return (
		<button
			className={`link f6 f5-l ph3 pv2 ma2 dib black ba bw1 b--${color} br2 bg-${color} ${!loading && `bg-animate hover-bg-transparent hover-${color} fill-white-hover pointer`} fill-black ${loading && 'o-50'}`}
			type="button"
			disabled={loading}
			onClick={() => {
				setLoading(true);
				if (onClick) {
					onClick();
				}
			}}
			{...props}
		>
			{loading ? 'loading...' : children}
		</button>
	);
};

Button.defaultProps = {
	color: 'white',
	onClick: undefined,
};

Button.propTypes = {
	children: PropTypes.node.isRequired,
	color: PropTypes.string,
	onClick: PropTypes.func,
};

export default Button;

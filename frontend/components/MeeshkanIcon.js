import React from 'react';
import PropTypes from 'prop-types';

const MeeshkanIcon = ({ dark = false }) => (
	<svg
		version='1.0'
		viewBox='0 0 185 185'
		xmlns='http://www.w3.org/2000/svg'
		width='30pt'
		height='30pt'
	>
		<g
			transform='translate(0,185) scale(0.1,-0.1)'
			fill={dark ? '#000' : '#fff'}
			stroke='none'
		>
			<title>Meeshkan Icon</title>
			<path d='M510 1761 c-138 -31 -236 -145 -248 -287 -16 -207 203 -315 511 -250 48 10 90 16 93 13 3 -3 -144 -169 -328 -369 -360 -393 -379 -415 -410 -484 -36 -82 -7 -169 74 -221 39 -25 51 -28 133 -28 77 1 97 5 140 27 28 14 60 37 72 50 11 12 88 129 170 258 217 342 347 533 382 563 38 32 83 41 160 34 73 -6 116 -28 137 -70 14 -27 17 -59 15 -190 -3 -258 -6 -285 -32 -313 -15 -16 -34 -24 -55 -24 -140 0 -208 -63 -220 -205 -9 -111 26 -142 181 -157 209 -20 354 18 422 113 61 86 67 131 67 529 1 352 1 355 -23 407 -48 108 -193 201 -355 229 -45 8 -193 18 -331 23 -190 6 -259 12 -287 24 -21 9 -38 20 -38 24 0 4 14 28 30 52 60 89 21 197 -85 234 -54 19 -132 27 -175 18z'/>
		</g>
	</svg>
);

MeeshkanIcon.defaultProps = {
	dark: false,
};

MeeshkanIcon.propTypes = {
	dark: PropTypes.bool,
};

export default MeeshkanIcon;

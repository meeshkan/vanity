import React from 'react';

const Footer = () => (
	<footer className='tc bg-center pb2 w-100 relative bg-white'>
		<div className='w-100 ph3 pv4'>
			<a
				className='link black bg-transparent dim inline-flex items-center ma2 tc br2 pa2'
				href='https://twitter.com/meeshkan'
				title='Twitter'
			>
				<svg
					className='dib h2 w2'
					fill='currentColor'
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 16 16'
					fillRule='evenodd'
					clipRule='evenodd'
					strokeLinejoin='round'
					strokeMiterlimit='1.414'
				>
					<path
						d='M16 3.038c-.59.26-1.22.437-1.885.517.677-.407 1.198-1.05 1.443-1.816-.634.375-1.337.648-2.085.795-.598-.638-1.45-1.036-2.396-1.036-1.812 0-3.282 1.468-3.282 3.28 0 .258.03.51.085.75C5.152 5.39 2.733 4.084 1.114 2.1.83 2.583.67 3.147.67 3.75c0 1.14.58 2.143 1.46 2.732-.538-.017-1.045-.165-1.487-.41v.04c0 1.59 1.13 2.918 2.633 3.22-.276.074-.566.114-.865.114-.21 0-.416-.02-.617-.058.418 1.304 1.63 2.253 3.067 2.28-1.124.88-2.54 1.404-4.077 1.404-.265 0-.526-.015-.783-.045 1.453.93 3.178 1.474 5.032 1.474 6.038 0 9.34-5 9.34-9.338 0-.143-.004-.284-.01-.425.64-.463 1.198-1.04 1.638-1.7z'
						fillRule='nonzero'
					/>
				</svg>
				<span className='f6 ml3 pr2'>Twitter</span>
			</a>
			<a
				className='link black bg-transparent dim inline-flex items-center ma2 tc br2 pa2'
				href='https://github.com/meeshkan'
				title='GitHub'
			>
				<svg
					className='dib h2 w2'
					fill='currentColor'
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 16 16'
					fillRule='evenodd'
					clipRule='evenodd'
					strokeLinejoin='round'
					strokeMiterlimit='1.414'
				>
					<path d='M8 0C3.58 0 0 3.582 0 8c0 3.535 2.292 6.533 5.47 7.59.4.075.547-.172.547-.385 0-.19-.007-.693-.01-1.36-2.226.483-2.695-1.073-2.695-1.073-.364-.924-.89-1.17-.89-1.17-.725-.496.056-.486.056-.486.803.056 1.225.824 1.225.824.714 1.223 1.873.87 2.33.665.072-.517.278-.87.507-1.07-1.777-.2-3.644-.888-3.644-3.953 0-.873.31-1.587.823-2.147-.083-.202-.358-1.015.077-2.117 0 0 .672-.215 2.2.82.638-.178 1.323-.266 2.003-.27.68.004 1.364.092 2.003.27 1.527-1.035 2.198-.82 2.198-.82.437 1.102.163 1.915.08 2.117.513.56.823 1.274.823 2.147 0 3.073-1.87 3.75-3.653 3.947.287.246.543.735.543 1.48 0 1.07-.01 1.933-.01 2.195 0 .215.144.463.55.385C13.71 14.53 16 11.534 16 8c0-4.418-3.582-8-8-8' />
				</svg>
				<span className='f6 ml3 pr2'>GitHub</span>
			</a>
			<span className='db'>
				<a
					className='link black dim inline-flex items-center ma2 tc br2 pa2'
					href='http://meeshkan.com/'
					title='Meeshkan'
				>
					<svg
						version='1.0'
						xmlns='http://www.w3.org/2000/svg'
						width='30pt'
						height='30pt'
						viewBox='0 0 185 185'
					>
						<g
							transform='translate(0,185) scale(0.1,-0.1)'
							fill='#000'
							stroke='none'
						>
							<path d='M510 1761 c-138 -31 -236 -145 -248 -287 -16 -207 203 -315 511 -250 48 10 90 16 93 13 3 -3 -144 -169 -328 -369 -360 -393 -379 -415 -410 -484 -36 -82 -7 -169 74 -221 39 -25 51 -28 133 -28 77 1 97 5 140 27 28 14 60 37 72 50 11 12 88 129 170 258 217 342 347 533 382 563 38 32 83 41 160 34 73 -6 116 -28 137 -70 14 -27 17 -59 15 -190 -3 -258 -6 -285 -32 -313 -15 -16 -34 -24 -55 -24 -140 0 -208 -63 -220 -205 -9 -111 26 -142 181 -157 209 -20 354 18 422 113 61 86 67 131 67 529 1 352 1 355 -23 407 -48 108 -193 201 -355 229 -45 8 -193 18 -331 23 -190 6 -259 12 -287 24 -21 9 -38 20 -38 24 0 4 14 28 30 52 60 89 21 197 -85 234 -54 19 -132 27 -175 18z'/>
						</g>
					</svg>
					<span className='f6 ml3 pr2'>Meeshkan</span>
				</a>
			</span>
		</div>
	</footer>
);

export default Footer;

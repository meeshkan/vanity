import React, { Component } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import Footer from './Footer';
import '../styles/slider.css';

const Page = ({ children }) => (
	<div className='slider-item relative slide'>
		{children}
	</div>
);

Page.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.array,
	]).isRequired,
};

export default class Slider extends Component {
	render() {
		return (
			<div>
				<div className='slider-container'>
					<Page>
						<div className='absolute w-100 vh-100'>
							<article className='vh-100 dt w-100'>
								<div className='dtc v-mid tc white ph3 ph4-l'>
									<h2 className='f2 f1-ns fw6 tc ttu f-subheadline-l mt0 mb3'>
										V A N I T Y
									</h2>
									<p className='i f5 tracked-mega-l'>weekly metrics for your GitHub repos</p>
									<div className='f6 f5-l pv3 v-mid'>
										<h3>start receiving your metrics</h3>
										<p>
											<Link href='/auth/github'>
												<a className='white dim no-underline'>
													<span className='v-mid'>Login with GitHub</span>
													<br />
													<svg
														className='dib mt3'
														viewBox='0 0 24 24'
														xmlns='http://www.w3.org/2000/svg'
														style={{ width: '2em', height: '2em' }}
														fill='#FFFFFF'
													>
														<title>GitHub Icon</title>
														<path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
													</svg>
												</a>
											</Link>
										</p>
									</div>
								</div>
							</article>
						</div>
					</Page>
					<Footer />
				</div>
			</div>
		);
	}
}

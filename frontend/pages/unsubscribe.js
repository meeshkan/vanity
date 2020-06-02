import React from 'react';
import Router from 'next/router';
import fetch from 'isomorphic-unfetch';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import getHost from '../utils/get-host';

export const Unsubscribe = props => {
	const { message, email } = props;

	return (
		<Layout>
			<main className='pa3 pa5-ns vh-100 w-100 white dt tc'>
				<div className='f4 lh-copy measure dtc v-mid'>
					{email ?
						<>
							<svg height='100px' width='100px' fill='#FFFFFF' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 164 164' x='0px' y='0px'>
								<g>
									<path d='M2.653,77.2C-8.051,60.834,16.396,45.005,27.1,61.368l31.825,48.519l77.66-89.438  c12.769-14.758,36.169,4.681,23.399,19.441L70.971,143.477c-6.153,8.111-18.177,7.353-23.849-1.319L2.653,77.2z' />
								</g>
							</svg>
							<h3><span className='courier bg-white black pa1'>{email}</span> successfully unsubscribed</h3>
							<p>You will no longer be receiving VANITY emails</p>
						</> :
						<>
							<svg height='100px' width='100px' fill='#FFFFFF' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' x='0px' y='0px'>
								<g>
									<path d='M84.74168,64.20527,63.00612,42.46862l21.73665-21.741a9.22255,9.22255,0,0,0,0-13.01013l-.00109-.00108A9.13577,9.13577,0,0,0,78.23743,5.0227h-.00435a9.126,9.126,0,0,0-6.49772,2.69371L49.99436,29.458,28.25771,7.71532A9.20051,9.20051,0,0,0,15.24812,20.72871L36.988,42.46373,15.247,64.20636a9.2004,9.2004,0,0,0,6.50751,15.70492,9.12229,9.12229,0,0,0,6.50424-2.69479L49.99436,55.47494l21.741,21.74155A9.19859,9.19859,0,1,0,84.74168,64.20527ZM82.22089,74.69679a5.62891,5.62891,0,0,1-7.96474,0l-23.0014-23.0014a1.78267,1.78267,0,0,0-2.52079,0L25.73692,74.699a5.63678,5.63678,0,0,1-7.968-.00109,5.64961,5.64961,0,0,1-.00108-7.97289l23.00031-23.0014a1.78267,1.78267,0,0,0-.00109-2.5197L17.76891,18.21009a5.63673,5.63673,0,1,1,7.96909-7.974l22.996,23.0014a1.78267,1.78267,0,0,0,2.52079,0L74.25724,10.235a5.58268,5.58268,0,0,1,3.978-1.64917h.00217A5.63671,5.63671,0,0,1,82.22089,18.209L59.226,41.20877a1.78332,1.78332,0,0,0,0,2.5197L82.222,66.725a5.62828,5.62828,0,0,1-.00109,7.97181Z' />
									<path d='M67.53441,86.51394A1.78127,1.78127,0,0,0,65.7531,84.7321H20.877a1.78185,1.78185,0,0,0,0,3.56369H65.7531A1.78127,1.78127,0,0,0,67.53441,86.51394Z' />
									<path d='M79.11612,91.41361H45.95544a1.78185,1.78185,0,0,0,0,3.56369H79.11612a1.78185,1.78185,0,0,0,0-3.56369Z' />
									<path d='M38.9031,91.41361H34.24a1.78185,1.78185,0,0,0,0,3.56369H38.9031a1.78185,1.78185,0,0,0,0-3.56369Z' />
								</g>
							</svg>
							<h3>unsubscription failed</h3>
							<p>{message}</p>
						</>}
				</div>
			</main>
			<Footer />
		</Layout>
	);
};

Unsubscribe.getInitialProps = async ({ req, res, query }) => {
	const url = `${getHost(req) || ''}/api/unsubscribe`;
	const { token, email } = query;

	if (!token && !email) {
		if (typeof window === 'undefined') {
			return res.writeHead(302, { Location: '/' }).end();
		}

		Router.push('/');
	}

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ token, email }),
		});

		const { errors, user } = await response.json();

		if (response.ok) {
			return user;
		}

		if (errors) {
			const { message } = errors;
			return { message };
		}
	} catch (error) {
		console.log(error); // TODO: handle error
	}
};

export default Unsubscribe;

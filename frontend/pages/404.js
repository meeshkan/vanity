import React from 'react';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import Main from '../components/Main';

const NotFound = () => (
	<Layout>
		<Main>
			<h1 className='f-headline'>404</h1>
			<p>this page does not exist</p>
		</Main>
		<Footer />
	</Layout>
);

export default NotFound;

import Router from 'next/router';
import fetch from 'isomorphic-unfetch';
import Cookies from 'js-cookie';
import NProgress from 'nprogress';
import { toast } from 'react-toastify';

export const COOKIES = ['github-user', 'jwt'];

class APIClient {
	constructor(token) {
		this.headers = {
			authorization: JSON.stringify({ token }),
			'content-type': 'application/json',
		};
	}

	post(path, body) {
		return fetch(path, {
			method: 'POST',
			headers: this.headers,
			body: JSON.stringify(body),
		});
	}
}

export function logout() {
	COOKIES.forEach(cookie => Cookies.remove(cookie));
	Router.push('/auth/logout');
}

export async function updateRepos(token, repos) {
	try {
		const client = new APIClient(token);
		const response = await client.post('/api/preferences/repos', { repos });

		if (response.ok) {
			Router.push('/preferences');
		}
	} catch (error) {
		console.error(error);
		toast.error('Something went wrong. Please try again.');
	}
}

export async function updateMetricTypes(token, metricTypes) {
	try {
		const client = new APIClient(token);
		const response = await client.post('/api/preferences/metric-types', { metricTypes });

		if (response.ok) {
			Router.push('/preferences');
		}
	} catch (error) {
		console.error(error);
		toast.error('Something went wrong. Please try again.');
	}
}

export async function resubscribe(token) {
	try {
		const client = new APIClient(token);
		const response = await client.post('/api/resubscribe');

		if (response.ok) {
			const { message } = await response.json();
			await Router.push('/preferences');
			toast.success(message, {
				className: 'avenir bg-blue center pa3 lh-copy',
			});
		}
	} catch (error) {
		console.error(error);
		toast.error('Something went wrong. Please try again.');
	}
}

export async function deleteAccount(token) {
	try {
		const client = new APIClient(token);
		const response = await client.post('/api/delete-account');

		if (response.ok) {
			return true;
		}

		return false;
	} catch (error) {
		console.error(error);
		toast.error('Something went wrong. Please try again.');
	}
}

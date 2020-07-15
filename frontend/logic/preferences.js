import Router from 'next/router';
import fetch from 'isomorphic-unfetch';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import toastOptions from '../utils/toast';

const COOKIES = ['github-user', 'jwt'];

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

	delete(path, body) {
		return fetch(path, {
			method: 'DELETE',
			headers: this.headers,
			body: JSON.stringify(body),
		});
	}
}

export function clearCookies() {
	COOKIES.forEach(cookie => Cookies.remove(cookie));
}

export function logout() {
	clearCookies();
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
		toast.error('Something went wrong. Please try again.', toastOptions.error);
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
		toast.error('Something went wrong. Please try again.', toastOptions.error);
	}
}

export async function resubscribe(token) {
	try {
		const client = new APIClient(token);
		const response = await client.post('/api/subscription');

		if (response.ok) {
			const { message } = await response.json();
			await Router.push('/preferences');
			toast.success(message, toastOptions.success);
			return;
		}

		const { error } = await response.json();
		toast.error(error.message, toastOptions.error);
	} catch (error) {
		console.error(error);
		toast.error('Something went wrong. Please try again.', toastOptions.error);
	}
}

export async function deleteAccount(token) {
	try {
		const client = new APIClient(token);
		const response = await client.delete('/api/user');
		return response.ok;
	} catch (error) {
		console.error(error);
		toast.error('Something went wrong. Please try again.', toastOptions.error);
	}
}

export async function cancelAccountDeletion(token) {
	try {
		const client = new APIClient(token);
		const response = await client.post('/api/user/recovery');

		if (response.ok) {
			const { message } = await response.json();
			await Router.push('/login');
			toast.success(message + ' - Please login again', toastOptions.success);
			return;
		}

		const { error } = await response.json();
		toast.error(error.message, toastOptions.error);
	} catch (error) {
		console.error(error);
		toast.error('Something went wrong. Please try again.', toastOptions.error);
	}
}

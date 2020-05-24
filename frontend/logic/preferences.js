import Router from 'next/router';
import fetch from 'isomorphic-unfetch';
import Cookies from 'js-cookie';

export const cookies = ['github-user', 'jwt'];

export function logout() {
	cookies.forEach(cookie => Cookies.remove(cookie));
	Router.push('/auth/logout');
}

export async function updateRepos(token, repos) {
	try {
		const response = await fetch('/api/preferences/repos', {
			method: 'POST',
			credentials: 'include',
			headers: {
				authorization: JSON.stringify({ token }),
				'content-type': 'application/json',
			},
			body: JSON.stringify({ repos }),
		});

		if (response.ok) {
			Router.push('/preferences');
		}
	} catch (error) {
		console.log(error); // TODO: handle error
	}
}

import React from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-unfetch';
import nextCookie from 'next-cookies';
import Cookies from 'js-cookie';
import moment from 'moment';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import { withAuthSync } from '../utils/auth';
import getHost from '../utils/get-host';

export const cookies = ['github-user', 'jwt'];

export function logout() {
	cookies.forEach(cookie => Cookies.remove(cookie));
	Router.push('/auth/logout');
}

export async function updateRepos(token, repos) {
    try {
        const response = await fetch('/api/preferences', {
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


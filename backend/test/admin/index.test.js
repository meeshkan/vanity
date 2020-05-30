const { serial: test } = require('ava');
const request = require('supertest');
const { OK, UNAUTHORIZED, NOT_FOUND } = require('http-status');
const { createTestUser, destroyTestUser, setUserAdmin } = require('../helpers');
const { generateToken } = require('../../utils/token');
const app = require('../../server');

const HTML_REGEX = /\s?<!doctype html>|(<html\b[^>]*>|<body\b[^>]*>|<x-[^>]+>)+/i;

test.before('create test user', createTestUser);
test.after.always('destroy test user', destroyTestUser);

test('GET /admin returns 401 - unauthenticated', async t => {
	const response = await request(app).get('/admin');
	t.is(response.status, UNAUTHORIZED);
});

test('GET /admin returns 404 - authenticated admin user', async t => {
	const { id, username, avatar } = t.context.user;
	const user = { id, username, avatar };
	const token = generateToken(user);

	await setUserAdmin(t.context.user, true);

	const response = await request(app)
		.get('/admin')
		.set('Cookie', [`jwt=${token}`])
		.send();

	t.is(response.status, NOT_FOUND);
});

test('GET /admin/queues returns 401 - unauthenticated', async t => {
	const response = await request(app).get('/admin/queues');
	t.is(response.status, UNAUTHORIZED);
});

test('GET /admin/queues returns 401 - authenticated non-admin user', async t => {
	const { id, username, avatar } = t.context.user;
	const user = { id, username, avatar };
	const token = generateToken(user);

	await setUserAdmin(t.context.user, false);

	const response = await request(app)
		.get('/admin/queues')
		.set('Cookie', [`jwt=${token}`])
		.send();

	t.is(response.status, UNAUTHORIZED);
});

test('GET /admin/queues returns admin dashboard - authenticated admin user', async t => {
	const { id, username, avatar } = t.context.user;
	const user = { id, username, avatar };
	const token = generateToken(user);

	await setUserAdmin(t.context.user, true);

	const response = await request(app)
		.get('/admin/queues')
		.set('Cookie', [`jwt=${token}`])
		.send();

	t.is(response.status, OK);
	t.is(response.type, 'text/html');
	t.regex(response.text, HTML_REGEX);
});

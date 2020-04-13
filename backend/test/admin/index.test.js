const { serial: test } = require('ava');
const request = require('supertest');
const { OK, UNAUTHORIZED, NOT_FOUND } = require('http-status');
const { GH_PROFILE } = require('../__fixtures__');
const { GITHUB_USER_TOKEN } = require('../../config');
const { generateToken } = require('../../utils/token');
const { User } = require('../../models');
const app = require('../../server');

const HTML_REGEX = /\s?<!doctype html>|(<html\b[^>]*>|<body\b[^>]*>|<x-[^>]+>)+/i;

test.before(async t => {
	await User.sync();
	const [user] = await User.upsert(
		{
			username: GH_PROFILE.username,
			email: GH_PROFILE.emails[0].value,
			token: GITHUB_USER_TOKEN,
			avatar: GH_PROFILE.photos[0].value,
			admin: true,
		},
		{
			returning: true,
		}
	);
	t.context.user = user.get({ plain: true });
});

test.after.always('cleanup', async t => {
	if (t.context.user.id) {
		await User.destroy({
			where: {
				id: t.context.user.id,
			},
		});
	}
});

test('GET /admin returns 401 - unauthenticated', async t => {
	const response = await request(app).get('/admin');
	t.is(response.status, UNAUTHORIZED);
});

test('GET /admin returns 404 - authenticated', async t => {
	const { id, username, avatar } = t.context.user;
	const user = { id, username, avatar };
	const token = generateToken(user);

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

test('GET /admin/queues returns admin dashboard - authenticated', async t => {
	const { id, username, avatar } = t.context.user;
	const user = { id, username, avatar };
	const token = generateToken(user);

	const response = await request(app)
		.get('/admin/queues')
		.set('Cookie', [`jwt=${token}`])
		.send();

	t.is(response.status, OK);
	t.is(response.type, 'text/html');
	t.regex(response.text, HTML_REGEX);
});

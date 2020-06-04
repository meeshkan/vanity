const test = require('ava');
const request = require('supertest');
const { OK, UNAUTHORIZED, FOUND } = require('http-status');
const { GH_PROFILE } = require('../__fixtures__');
const { generateToken } = require('../../utils/token');
const app = require('../../server');

test('GET /auth returns 401 - unauthenticated', async t => {
	const response = await request(app).get('/auth');
	t.is(response.status, UNAUTHORIZED);
});

test('GET /auth returns user data - authenticated', async t => {
	const id = Number.parseInt(GH_PROFILE.id, 10);
	const { username } = GH_PROFILE;
	const avatar = GH_PROFILE.photos[0].value;
	const user = { id, username, avatar };
	const token = generateToken(user);

	const response = await request(app)
		.get('/auth')
		.set('Cookie', [`jwt=${token}`])
		.send();

	t.is(response.status, OK);
	t.is(response.body.avatar, avatar);
	t.false(response.body.exp > 0);
	t.true(response.body.iat > 0);
	t.is(response.body.id, id);
	t.is(response.body.username, username);
});

test('GET /auth/github redirects to auth URL', async t => {
	const response = await request(app).get('/auth/github');
	t.is(response.status, FOUND);
	t.regex(response.headers.location, /^https:\/\/github.com\/login\/oauth\/authorize\?response_type=code&redirect_uri=http/);
});

test('GET /auth/github/callback redirects to auth URL', async t => {
	const response = await request(app).get('/auth/github/callback');
	t.is(response.status, FOUND);
	t.regex(response.headers.location, /^https:\/\/github.com\/login\/oauth\/authorize\?response_type=code&redirect_uri=http/);
});

test('GET /auth/logout redirects to /login', async t => {
	const response = await request(app).get('/auth/logout');
	t.is(response.status, FOUND);
	t.is(response.headers.location, '/login');
});

const { serial: test } = require('ava');
const request = require('supertest');
const { OK, UNAUTHORIZED, NOT_FOUND } = require('http-status');
const _ = require('lodash');
const { GH_PROFILE, REPOS } = require('../__fixtures__');
const { GITHUB_USER_TOKEN } = require('../../config');
const { generateToken } = require('../../utils/token');
const { User } = require('../../models');
const app = require('../../server');

const repoKeys = ['name', 'fork', 'selected'];
const containsRepoKeys = repo => repoKeys.every(key => key in repo);

test.before(async t => {
	await User.sync();
	const [user] = await User.upsert(
		{
			username: GH_PROFILE.username,
			email: GH_PROFILE.email,
			token: GITHUB_USER_TOKEN,
			avatar: GH_PROFILE.photos[0].value,
			repos: REPOS,
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

test('GET /api returns 404', async t => {
	const response = await request(app).get('/api');
	t.is(response.status, NOT_FOUND);
});

test('GET /api/preferences returns 401 - unaunthenticated', async t => {
	const response = await request(app).get('/api/preferences');
	t.is(response.status, UNAUTHORIZED);
});

test('GET /api/preferences returns user w/ repos - authenticated', async t => {
	const { id, username, avatar } = t.context.user;
	const user = { id, username, avatar };
	const token = generateToken(user);

	const response = await request(app)
		.get('/api/preferences')
		.set('authorization', JSON.stringify({ token }));

	t.is(response.status, OK);
	t.is(response.body.avatar, avatar);
	t.true(response.body.exp > 0);
	t.true(response.body.iat > 0);
	t.is(response.body.id, id);
	t.true(Array.isArray(response.body.repos));
	t.is(response.body.repos.length, REPOS.length);
	t.true(response.body.repos.every(containsRepoKeys));
	t.is(response.body.username, username);
});

test('POST /api/preferences returns 401 - unaunthenticated', async t => {
	const response = await request(app).post('/api/preferences');
	t.is(response.status, UNAUTHORIZED);
});

test('POST /api/preferences updates repos - authenticated', async t => {
	const { id, username, avatar } = t.context.user;
	const user = { id, username, avatar };
	const token = generateToken(user);

	const ALTERED_REPOS = _.cloneDeep(REPOS).map(repo => {
		repo.selected = false;
		return repo;
	});

	const alteredResponse = await request(app)
		.post('/api/preferences')
		.set('authorization', JSON.stringify({ token }))
		.send({ repos: ALTERED_REPOS });

	t.is(alteredResponse.status, OK);

	const userByID = await User.findByPk(id);
	t.deepEqual(userByID.get({ plain: true }).repos, ALTERED_REPOS);
});

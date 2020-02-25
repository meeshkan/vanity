require('dotenv').config();
const test = require('ava');
const request = require('supertest');
const app = require('../../server');
const unmock = require('unmock').default;

test.beforeEach.cb(t => {
    unmock.on();
    setTimeout(t.end);
});

test.afterEach.cb(t => {
    unmock.off();
    setTimeout(t.end);
});


test('calls github', async t => {
    t.timeout(1000 * 10); // cuz sometimes the ci environment is super sluggish with redis
    const response = await request(app).get('/auth/github');
    t.is(response.status, 500);
});
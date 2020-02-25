require('dotenv').config();
const test = require('ava');
const request = require('supertest');
const app = require('../../server');

test.beforeEach.cb(t => {
    setTimeout(t.end);
});

test.afterEach.cb(t => {
    setTimeout(t.end);
});


test('calls github', async t => {
    const response = await request(app).get('/auth/github');
    t.is(response.status, 500);
});
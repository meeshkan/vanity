const test = require('ava');
const { send, sendSample } = require('../../utils/email');
const { USER, WEEKLY_METRICS, SAMPLE_METRICS } = require('../../utils/__fixtures__');
const { EMAIL_CONFIG } = require('../../config');

const HTML_REGEX = /\s?<!doctype html>|(<html\b[^>]*>|<body\b[^>]*>|<x-[^>]+>)+/i

test('generates weekly email', async t => {
	const email = await send({
        user: USER,
        metrics: WEEKLY_METRICS,
    });

    t.is(email.to, USER.email);
    t.is(email.from, EMAIL_CONFIG.vanityAddress);
	t.is(email.subject, EMAIL_CONFIG.subject);
    t.regex(email.html, HTML_REGEX);
});

test('generates sample email', async t => {
	const email = await sendSample({
        user: USER,
        metrics: SAMPLE_METRICS,
    });

    t.is(email.to, USER.email);
    t.is(email.from, EMAIL_CONFIG.vanityAddress);
	t.is(email.subject, EMAIL_CONFIG.sampleSubject);
    t.regex(email.html, HTML_REGEX);
});

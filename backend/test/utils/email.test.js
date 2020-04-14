const test = require('ava');
const sinon = require('sinon');
const SGMail = require('@sendgrid/mail');
const {
	createWeeklyEmail,
	createSampleEmail,
	sendSample,
	send,
} = require('../../utils/email');
const { USER, WEEKLY_METRICS, SAMPLE_METRICS, SENDGRID_SUCCESS } = require('../__fixtures__');
const { EMAIL_CONFIG } = require('../../config');

const HTML_REGEX = /\s?<!doctype html>|(<html\b[^>]*>|<body\b[^>]*>|<x-[^>]+>)+/i;

test('generates weekly email', async t => {
	const email = await createWeeklyEmail({
		user: USER,
		metrics: WEEKLY_METRICS,
	});

	t.is(email.to, USER.email);
	t.is(email.from, EMAIL_CONFIG.vanityAddress);
	t.is(email.subject, EMAIL_CONFIG.subject);
	t.regex(email.html, HTML_REGEX);
});

test('generates weekly email for empty metrics', async t => {
	const email = await createWeeklyEmail({
		user: USER,
		metrics: [],
	});

	t.is(email.to, USER.email);
	t.is(email.from, EMAIL_CONFIG.vanityAddress);
	t.is(email.subject, EMAIL_CONFIG.subject);
	t.regex(email.html, HTML_REGEX);
	t.regex(email.html, /It seems like you don&apos;t have any repos yet/);
});

test('generates sample email', async t => {
	const email = await createSampleEmail({
		user: USER,
		metrics: SAMPLE_METRICS,
	});

	t.is(email.to, USER.email);
	t.is(email.from, EMAIL_CONFIG.vanityAddress);
	t.is(email.subject, EMAIL_CONFIG.sampleSubject);
	t.regex(email.html, HTML_REGEX);
});

test('generates sample email for empty metrics', async t => {
	const email = await createSampleEmail({
		user: USER,
		metrics: [],
	});

	t.is(email.to, USER.email);
	t.is(email.from, EMAIL_CONFIG.vanityAddress);
	t.is(email.subject, EMAIL_CONFIG.sampleSubject);
	t.regex(email.html, HTML_REGEX);
	t.regex(email.html, /It seems like you don&apos;t have any repos yet/);
});

test('sends a weekly email', async t => {
	const SGMailSend = sinon.stub(SGMail, 'send');
	SGMailSend.returns(Promise.resolve(SENDGRID_SUCCESS));

	const data = {
		user: USER,
		metrics: WEEKLY_METRICS,
	};

	const response = await send(data);
	t.true(SGMailSend.calledOnce);
	sinon.assert.calledWith(SGMailSend, createWeeklyEmail(data));
	t.deepEqual(response, SENDGRID_SUCCESS);

	SGMailSend.restore();
});

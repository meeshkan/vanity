const test = require('ava');
const sinon = require('sinon');
const SGMail = require('@sendgrid/mail');
const moment = require('moment');
const {
	createWeeklyEmail,
	createSampleEmail,
	sendSample,
	send,
	sendEmail,
} = require('../../utils/email');
const { USER, WEEKLY_METRICS, SAMPLE_METRICS, SENDGRID_SUCCESS } = require('../__fixtures__');
const { EMAIL_CONFIG, SENDGRID_API_KEY } = require('../../config');

const HTML_REGEX = /\s?<!doctype html>|(<html\b[^>]*>|<body\b[^>]*>|<x-[^>]+>)+/i;

test('generates weekly email', async t => {
	const email = await createWeeklyEmail({
		user: USER,
		metrics: WEEKLY_METRICS,
		date: moment().format('LL'),
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
		date: moment().format('LL'),
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

test.serial('sends a weekly email', async t => {
	const SGMailSend = sinon.stub(SGMail, 'send');
	SGMailSend.returns(Promise.resolve(SENDGRID_SUCCESS));

	const data = {
		user: USER,
		metrics: WEEKLY_METRICS,
		date: moment().format('LL'),
	};

	const response = await send(data);
	t.true(SGMailSend.calledOnce);
	sinon.assert.calledWith(SGMailSend, createWeeklyEmail(data));
	t.deepEqual(response, SENDGRID_SUCCESS);

	SGMailSend.restore();
});

test.serial('sends a sample email', async t => {
	const SGMailSend = sinon.stub(SGMail, 'send');
	SGMailSend.returns(Promise.resolve(SENDGRID_SUCCESS));

	const data = {
		user: USER,
		metrics: SAMPLE_METRICS,
	};

	const response = await sendSample(data);
	t.true(SGMailSend.calledOnce);
	sinon.assert.calledWith(SGMailSend, createSampleEmail(data));
	t.deepEqual(response, SENDGRID_SUCCESS);

	SGMailSend.restore();
});

test.serial('sends an email', async t => {
	const SGMailSetApiKey = sinon.stub(SGMail, 'setApiKey');
	const SGMailSend = sinon.stub(SGMail, 'send');
	SGMailSend.returns(Promise.resolve(SENDGRID_SUCCESS));

	const email = {
		to: USER.email,
		from: EMAIL_CONFIG.vanityAddress,
		subject: EMAIL_CONFIG.subject,
		html: '<html><body><h1>Just Another Email</h1></body></html>',
	};

	const response = await sendEmail(email);
	t.true(SGMailSetApiKey.calledOnce);
	sinon.assert.calledWith(SGMailSetApiKey, SENDGRID_API_KEY);
	t.true(SGMailSend.calledOnce);
	sinon.assert.calledWith(SGMailSend, email);
	t.deepEqual(response, SENDGRID_SUCCESS);

	SGMailSetApiKey.restore();
	SGMailSend.restore();
});

test('handles invalid emails', async t => {
	const email = {
		to: 'not_a_valid_email',
		from: EMAIL_CONFIG.vanityAddress,
		subject: EMAIL_CONFIG.subject,
		html: '<html><body><h1>Just Another Email</h1></body></html>',
	};

	const error = await t.throwsAsync(sendEmail(email));
	t.is(error.message, 'Bad Request');
});

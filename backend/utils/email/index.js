const fs = require('fs');
const { join } = require('path');
const ejs = require('ejs');
const SGMail = require('@sendgrid/mail');
const { SENDGRID_API_KEY, EMAIL_CONFIG, NODE_ENV } = require('../../config');

const createWeeklyEmail = data => {
	const message = ejs.render(
		fs.readFileSync(join(__dirname, '/templates/weekly.ejs'), 'utf8'),
		data,
	);

	const email = {
		to: data.user.email,
		from: EMAIL_CONFIG.vanityAddress,
		subject: EMAIL_CONFIG.subject,
		html: message,
	};

	return email;
};

const createSampleEmail = data => {
	const message = ejs.render(
		fs.readFileSync(join(__dirname, '/templates/sample.ejs'), 'utf8'),
		data,
	);

	const email = {
		to: data.user.email,
		from: EMAIL_CONFIG.vanityAddress,
		subject: EMAIL_CONFIG.sampleSubject,
		html: message,
	};

	return email;
};

const sendEmail = async email => {
	try {
		SGMail.setApiKey(SENDGRID_API_KEY);
		return await SGMail.send(email);
	} catch (error) {
		throw new Error(error.message);
	}
};

const sendSample = async data => {
	const email = createSampleEmail(data);

	return sendEmail(email);
};

const send = async data => {
	const email = createWeeklyEmail(data);

	return sendEmail(email);
};

module.exports = {
	createWeeklyEmail,
	createSampleEmail,
	sendSample,
	send,
};

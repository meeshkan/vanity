const { setQueues } = require('bull-board');
const metrics = require('../utils/metrics');
const email = require('../utils/email');
const moment = require('moment');
const { generateToken } = require('../utils/token');
const { createQueue } = require('./queue');

const ingestMetrics = createQueue('ingestMetrics');
const sendEmail = createQueue('sendEmail');
const sendSampleEmail = createQueue('sendSampleEmail');
const deleteAccount = createQueue('deleteAccount');

const ingestMetricsWorker = job => {
	const { userID } = job.data;
	return metrics.ingest(userID);
};

const sendEmailWorker = async job => {
	const { user } = job.data;
	user.unsubscriptionToken = await generateToken({ email: user.email, id: user.id });
	const weekMetrics = await metrics.fetchComparison(user.id);
	if (!weekMetrics) {
		const currentMetrics = await metrics.fetchCurrent(user.id);
		return email.sendSample({
			user,
			metrics: currentMetrics,
		});
	}

	return email.send({
		user,
		metrics: weekMetrics,
		date: moment().format('LL'),
	});
};

const sendSampleEmailWorker = async job => {
	const { user } = job.data;
	user.unsubscriptionToken = await generateToken({ email: user.email, id: user.id });
	const currentMetrics = await metrics.fetchCurrent(user.id, user.selectedRepos);
	return email.sendSample({
		user,
		metrics: currentMetrics,
	});
};

const deleteAccountWorker = async job => {
	const { User } = require('../models');
	const { userID } = job.data;
	const user = await User.findByPk(userID);
	return user.destroy();
};

ingestMetrics.process(ingestMetricsWorker);
sendEmail.process(sendEmailWorker);
sendSampleEmail.process(sendSampleEmailWorker);
deleteAccount.process(deleteAccountWorker);

setQueues([
	ingestMetrics,
	sendEmail,
	sendSampleEmail,
	deleteAccount,
]);

module.exports = {
	ingestMetrics,
	sendEmail,
	sendSampleEmail,
	deleteAccount,
	ingestMetricsWorker,
	sendEmailWorker,
	sendSampleEmailWorker,
	deleteAccountWorker,
};

const test = require('ava');
const sinon = require('sinon');
const metrics = require('../../utils/metrics');
const email = require('../../utils/email');
const {
	USER,
	SNAPSHOT,
	WEEKLY_METRICS,
	SAMPLE_METRICS,
	SENDGRID_SUCCESS,
} = require('../../utils/__fixtures__');
const {
	ingestMetricsWorker,
	sendEmailWorker,
	sendSampleEmailWorker,
} = require('../../workers/queues');

const user = {
	id: USER.id,
	email: USER.email,
	username: USER.username,
	selectedRepos: USER.selectedRepos,
};

const job = {
	data: { user }
};

test('ingestMetricsWorker calls metrics.ingest()', async t => {
	const ingest = sinon.stub(metrics, 'ingest');
	ingest.returns(Promise.resolve(SNAPSHOT));

	const jobResult = await ingestMetricsWorker({ data: { userID: user.id } });

	t.true(ingest.calledOnce);
	sinon.assert.calledWith(ingest, user.id);
	t.deepEqual(jobResult, SNAPSHOT);

	ingest.restore();
});

test('sendEmailWorker calls metrics.fetchComparison() and email.send()', async t => {
	const fetchComparison = sinon.stub(metrics, 'fetchComparison');
	fetchComparison.returns(Promise.resolve(WEEKLY_METRICS));
	const send = sinon.stub(email, 'send');
	send.returns(Promise.resolve(SENDGRID_SUCCESS));

	const jobResult = await sendEmailWorker(job);

	t.true(fetchComparison.calledOnce);
	t.true(send.calledOnce);

	sinon.assert.calledWith(fetchComparison, user.id);
	sinon.assert.calledWith(send, {
		user,
		metrics: WEEKLY_METRICS
	});

	t.deepEqual(jobResult, SENDGRID_SUCCESS);

	fetchComparison.restore();
	send.restore();
});

test('sendSampleEmailWorker calls metrics.fetchCurrent() and email.sendSample()', async t => {
	const fetchCurrent = sinon.stub(metrics, 'fetchCurrent');
	fetchCurrent.returns(Promise.resolve(SAMPLE_METRICS));
	const sendSample = sinon.stub(email, 'sendSample');
	sendSample.returns(Promise.resolve(SENDGRID_SUCCESS));

	const jobResult = await sendSampleEmailWorker(job);

	t.true(fetchCurrent.calledOnce);
	t.true(sendSample.calledOnce);

	sinon.assert.calledWith(fetchCurrent, user.id, user.selectedRepos);
	sinon.assert.calledWith(sendSample, {
		user,
		metrics: SAMPLE_METRICS
	});

	t.deepEqual(jobResult, SENDGRID_SUCCESS);

	fetchCurrent.restore();
	sendSample.restore();
});

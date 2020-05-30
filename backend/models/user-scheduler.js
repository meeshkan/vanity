const {
	ingestMetricsJob,
	sendEmailJob,
	sendSampleEmailJob
} = require('../workers/jobs');

class UserSchedulerBase {
	scheduleForUser(user) {}
}

class UserScheduler extends UserSchedulerBase {
	scheduleForUser(user) {
		ingestMetricsJob(user);
		sendSampleEmailJob(user);
		sendEmailJob(user);
	}
}

class DummyUserScheduler extends UserSchedulerBase {
	scheduleForUser(user) {}
}

module.exports = {
	UserScheduler,
	DummyUserScheduler,
};

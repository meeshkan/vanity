const {
	ingestMetricsJob,
	sendEmailJob,
	sendSampleEmailJob,
	deleteAccountJob,
} = require('../workers/jobs');

class UserSchedulerBase {
	scheduleForUser(user) {}
	scheduleDeletionOfUser(user) {}
}

class UserScheduler extends UserSchedulerBase {
	scheduleForUser(user) {
		ingestMetricsJob(user);
		sendSampleEmailJob(user);
		sendEmailJob(user);
	}

	scheduleDeletionOfUser(user) {
		deleteAccountJob(user);
	}
}

class DummyUserScheduler extends UserSchedulerBase {
	scheduleForUser(user) {}
	scheduleDeletionOfUser(user) {}
}

module.exports = {
	UserScheduler,
	DummyUserScheduler,
};

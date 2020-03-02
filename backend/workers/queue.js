const Queue = require('bull');
const { REDIS_URL } = require('../config');
const logger = require('../utils/logger');

const createQueue = name => {
	const log = logger.child({ module: `queue:${name}` });
	const queue = new Queue(name, REDIS_URL)
		.on('error', error => {
			log.error({ message: `Queue ${name} error`, error: error.message, stack: error.message });
		})
		.on('waiting', jobID => {
			log.debug(`Job ${jobID} is waiting.`);
		})
		.on('active', job => {
			log.debug(`Job ${job.id} is active.`);
		})
		.on('stalled', job => {
			log.debug(`Job ${job.id} has stalled.`);
		})
		.on('progress', (job, progress) => {
			log.debug(`Job ${job.id} progress: ${progress}`);
		})
		.on('completed', job => {
			log.debug(`Job ${job.id} completed.`);
		})
		.on('failed', (job, error) => {
			log.error({ message: `Job ${job.id} failed.`, error: error.message, stack: error.message });
		})
		.on('paused', job => {
			log.debug(`Queue ${name} resumed. ID: ${job.id}`);
		})
		.on('resumed', job => {
			log.debug(`Queue ${name} resumed. ID: ${job.id}`);
		})
		.on('cleaned', (jobs, types) => {
			log.debug(`Queue ${name} was cleaned. Jobs: ${jobs} Types: ${types}`);
		})
		.on('drained', () => {
			log.debug(`Queue ${name} was drained.`);
		})
		.on('removed', job => {
			log.debug(`Job ${job.id} was removed.`);
		});

	return queue;
};

module.exports = {
	createQueue,
};

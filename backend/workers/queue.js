const Queue = require('bull');
const { REDIS_URL } = require('../config');
const logger = require('../utils/logger');

const createQueue = name => {
	const log = logger.child({ module: `queue:${name}` });
	const queue = new Queue(name, REDIS_URL)
		.on('error', error => {
			log.error({ error }, `Queue ${name} error.`);
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
			log.error({ error }, `Job ${job.id} failed.`);
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

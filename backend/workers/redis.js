const Redis = require('ioredis');
const { REDIS_URL } = require('../config');

const REDIS_OPTIONS = { connectTimeout: 10000 };

module.exports = {
	createRedis: () => new Redis(REDIS_URL, REDIS_OPTIONS),
};

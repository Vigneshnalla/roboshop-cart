const redis = require('redis');
const { logger } = require('../utils/logger');

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'redis',
});

let redisConnected = false;

redisClient.on('error', (e) => logger.error('Redis ERROR', e));
redisClient.on('ready', () => {
    logger.info('Redis READY');
    redisConnected = true;
});

module.exports = { redisClient, redisConnected };

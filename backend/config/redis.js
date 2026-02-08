
const { createClient } = require('redis');

const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log('Redis Connected from Config');
    }
})();

module.exports = redisClient;

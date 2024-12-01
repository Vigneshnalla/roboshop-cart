module.exports = {
    redisHost: process.env.REDIS_HOST || 'redis',
    catalogueHost: process.env.CATALOGUE_HOST || 'catalogue',
    cataloguePort: process.env.CATALOGUE_PORT || '8080',
    port: process.env.CART_SERVER_PORT || '8080',
};

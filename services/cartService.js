const { redisClient } = require('./redisClient');

function saveCart(id, cart) {
    return new Promise((resolve, reject) => {
        redisClient.setex(id, 3600, JSON.stringify(cart), (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function getCart(id) {
    return new Promise((resolve, reject) => {
        redisClient.get(id, (err, data) => {
            if (err) reject(err);
            else resolve(data ? JSON.parse(data) : null);
        });
    });
}

module.exports = { saveCart, getCart };

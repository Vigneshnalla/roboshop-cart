const request = require('request');
const { catalogueHost, cataloguePort } = require('../config/config');

function getProduct(sku) {
    return new Promise((resolve, reject) => {
        request(
            `http://${catalogueHost}:${cataloguePort}/product/${sku}`,
            (err, res, body) => {
                if (err) reject(err);
                else if (res.statusCode !== 200) resolve(null);
                else resolve(JSON.parse(body));
            }
        );
    });
}

module.exports = { getProduct };

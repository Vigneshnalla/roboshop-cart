// Initialize Redis connection and check readiness
const redis = require('redis');
const request = require('request');
const bodyParser = require('body-parser');
const express = require('express');
const pino = require('pino');
const expPino = require('express-pino-logger');
const promClient = require('prom-client');
const Registry = promClient.Registry;
const register = new Registry();
const counter = new promClient.Counter({
    name: 'items_added',
    help: 'running count of items added to cart',
    registers: [register]
});

var redisConnected = false;

const redisHost = process.env.REDIS_HOST || 'redis';
const catalogueHost = process.env.CATALOGUE_HOST || 'catalogue';
const cataloguePort = process.env.CATALOGUE_PORT || '8080';

const logger = pino({
    level: 'info',
    prettyPrint: false,
    useLevelLabels: true
});

const expLogger = expPino({
    logger: logger
});

const app = express();

app.use(expLogger);

app.use((req, res, next) => {
    res.set('Timing-Allow-Origin', '*');
    res.set('Access-Control-Allow-Origin', '*');
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Prometheus endpoint for monitoring
app.get('/metrics', (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send(register.metrics());
});

// Health check
app.get('/health', (req, res) => {
    var stat = {
        app: 'OK',
        redis: redisConnected
    };
    res.json(stat);
});

// Redis Client initialization
const redisClient = redis.createClient({
    host: redisHost
});

redisClient.on('error', (e) => {
    logger.error('Redis ERROR', e);
});

redisClient.on('ready', () => {
    logger.info('Redis READY');
    redisConnected = true;
});

// Ensure that Redis connection is established before processing requests
app.use((req, res, next) => {
    if (!redisConnected) {
        return res.status(500).send('Redis is not connected');
    }
    next();
});

// Cart Routes
app.get('/cart/:id', (req, res) => {
    redisClient.get(req.params.id, (err, data) => {
        if (err) {
            req.log.error('ERROR', err);
            res.status(500).send(err);
        } else {
            if (data == null) {
                res.status(404).send('Cart not found');
            } else {
                res.set('Content-Type', 'application/json');
                res.send(data);
            }
        }
    });
});

// Update or add item to cart
app.get('/add/:id/:sku/:qty', async (req, res) => {
    const qty = parseInt(req.params.qty);
    if (isNaN(qty) || qty < 1) {
        return res.status(400).send('Quantity must be a positive number');
    }

    try {
        const product = await getProduct(req.params.sku);
        if (!product) return res.status(404).send('Product not found');
        if (product.instock === 0) return res.status(404).send('Out of stock');

        redisClient.get(req.params.id, (err, data) => {
            if (err) {
                req.log.error('ERROR', err);
                return res.status(500).send(err);
            }

            let cart = data ? JSON.parse(data) : { total: 0, tax: 0, items: [] };
            const item = {
                qty: qty,
                sku: req.params.sku,
                name: product.name,
                price: product.price,
                subtotal: qty * product.price
            };

            cart.items = mergeList(cart.items, item, qty);
            cart.total = calcTotal(cart.items);
            cart.tax = calcTax(cart.total);

            saveCart(req.params.id, cart)
                .then(() => {
                    counter.inc(qty);
                    res.json(cart);
                })
                .catch((err) => {
                    req.log.error(err);
                    res.status(500).send(err);
                });
        });
    } catch (err) {
        req.log.error(err);
        res.status(500).send(err);
    }
});

function getProduct(sku) {
    return new Promise((resolve, reject) => {
        request(`http://${catalogueHost}:${cataloguePort}/product/${sku}`, (err, res, body) => {
            if (err) {
                reject(err);
            } else if (res.statusCode !== 200) {
                resolve(null);
            } else {
                resolve(JSON.parse(body));
            }
        });
    });
}

function saveCart(id, cart) {
    logger.info('Saving cart:', cart);
    return new Promise((resolve, reject) => {
        redisClient.setex(id, 3600, JSON.stringify(cart), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Start the app
const port = process.env.CART_SERVER_PORT || '8080';
app.listen(port, () => {
    logger.info('Cart service started on port', port);
});

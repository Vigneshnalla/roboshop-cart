const express = require('express');
const promClient = require('prom-client');

const router = express.Router();
const register = new promClient.Registry();

const counter = new promClient.Counter({
    name: 'items_added',
    help: 'running count of items added to cart',
    registers: [register],
});

router.get('/metrics', (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send(register.metrics());
});

module.exports = router;

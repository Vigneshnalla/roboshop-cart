require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const { expLogger, logger } = require('./utils/logger');
const { port } = require('./config/config');
const healthRoutes = require('./routes/health');
const cartRoutes = require('./routes/cart');
const metricsRoutes = require('./routes/metrics');

const app = express();

app.use(expLogger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
    res.set('Timing-Allow-Origin', '*');
    res.set('Access-Control-Allow-Origin', '*');
    next();
});

// Mount Routes
app.use('/', healthRoutes);
app.use('/', cartRoutes);
app.use('/', metricsRoutes);

// Start server
app.listen(port, () => logger.info(`Started on port ${port}`));

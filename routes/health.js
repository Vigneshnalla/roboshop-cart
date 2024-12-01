const express = require('express');
const { redisConnected } = require('../services/redisClient');
const router = express.Router();

router.get('/health', (req, res) => {
    res.json({ app: 'OK', redis: redisConnected });
});

module.exports = router;

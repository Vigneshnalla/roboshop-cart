const express = require('express');
const { getProduct } = require('../services/productService');
const { getCart, saveCart } = require('../services/cartService');
const { mergeList, calcTotal, calcTax } = require('../utils/helpers');

const router = express.Router();

router.get('/cart/:id', async (req, res) => {
    try {
        const cart = await getCart(req.params.id);
        if (!cart) res.status(404).send('cart not found');
        else res.json(cart);
    } catch (err) {
        req.log.error(err);
        res.status(500).send(err);
    }
});

// Other endpoints (add, update, delete) follow the same modular approach

module.exports = router;

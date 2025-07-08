const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }

    const order = new Order({
        userId: req.user.id,
        items: cart.items
    });

    await order.save();
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
});

router.get('/', verifyToken, async (req, res) => {
    const orders = await Order.find({ userId: req.user.id }).populate('items.productId');
    res.json(orders);
});

module.exports = router;
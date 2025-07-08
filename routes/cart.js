const express = require('express');
const Cart = require('../models/Cart');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    res.json(cart || { items: [] });
});

router.post('/add', verifyToken, async (req, res) => {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
        cart = new Cart({ userId: req.user.id, items: [{ productId, quantity }] });
    } else {
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex >= 0) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }
    }
    await cart.save();
    res.json(cart);
});

router.put('/update', verifyToken, async (req, res) => {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(item => item.productId.toString() === productId);
    if (item) item.quantity = quantity;
    await cart.save();
    res.json(cart);
});

router.delete('/remove/:productId', verifyToken, async (req, res) => {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
    await cart.save();
    res.json(cart);
});

module.exports = router;
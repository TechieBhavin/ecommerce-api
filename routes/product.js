const express = require('express');
const Product = require('../models/Product');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const products = await Product.find(query).skip((page - 1) * limit).limit(Number(limit));
    res.json(products);
});

router.post('/', verifyToken, isAdmin, async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
});

module.exports = router;
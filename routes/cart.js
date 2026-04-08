const express     = require('express');
const router      = express.Router();
const Product     = require('../models/Product');
const requireAuth = require('../middleware/auth');

/* ── GET /api/cart ── */
router.get('/', requireAuth, (req, res) => {
  const cart  = req.session.cart || [];
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  res.json({ cart, total, count });
});

/* ── POST /api/cart/add ── */
router.post('/add', requireAuth, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (!req.session.cart) req.session.cart = [];
    const existing = req.session.cart.find(i => i.productId === productId);
    if (existing) {
      existing.quantity += parseInt(quantity);
    } else {
      req.session.cart.push({
        productId,
        name:     product.name,
        price:    product.price,
        image:    product.image,
        category: product.category,
        quantity: parseInt(quantity)
      });
    }
    const count = req.session.cart.reduce((s, i) => s + i.quantity, 0);
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/cart/update ── */
router.post('/update', requireAuth, (req, res) => {
  const { productId, quantity } = req.body;
  const cart = req.session.cart || [];
  const item = cart.find(i => i.productId === productId);
  if (item) {
    item.quantity = parseInt(quantity);
    if (item.quantity <= 0)
      req.session.cart = cart.filter(i => i.productId !== productId);
  }
  const total = (req.session.cart || []).reduce((s, i) => s + i.price * i.quantity, 0);
  const count = (req.session.cart || []).reduce((s, i) => s + i.quantity, 0);
  res.json({ success: true, total, count });
});

/* ── POST /api/cart/remove ── */
router.post('/remove', requireAuth, (req, res) => {
  req.session.cart = (req.session.cart || []).filter(i => i.productId !== req.body.productId);
  const total = req.session.cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = req.session.cart.reduce((s, i) => s + i.quantity, 0);
  res.json({ success: true, total, count });
});

/* ── POST /api/cart/checkout ── */
router.post('/checkout', requireAuth, (req, res) => {
  const total = (req.session.cart || []).reduce((s, i) => s + i.price * i.quantity, 0);
  req.session.cart = [];
  res.json({ success: true, total });
});

module.exports = router;

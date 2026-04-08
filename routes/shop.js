const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');

/* ── Seed catalogue ─────────────────────────────────────── */
const SEED = [
  { name:'Football Cleats',         description:'Lightweight cleats with a carbon-fibre outsole for explosive acceleration and superior traction on natural grass.',          price:9999,  category:'Football',   image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', stock:14, rating:4.6 },
  { name:'NBA Official Basketball', description:'Official size and weight with deep channels for improved grip and consistent bounce on hardwood.',                            price:4999,  category:'Basketball', image:'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&q=80', stock:16, rating:4.7 },
  { name:'English Willow Bat',      description:'Grade-1 English willow with a thick spine for maximum power. Ideal for professional and club cricketers.',                   price:7499,  category:'Cricket',    image:'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&q=80', stock:12, rating:4.5 },
  { name:'Cricket Helmet',          description:'Steel grille helmet with multi-directional impact protection and moisture-wicking inner lining.',                            price:5999,  category:'Cricket',    image:'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&q=80', stock:15, rating:4.4 },
  { name:'Graphite Racket',         description:'100 sq-in head graphite frame for a blend of power and precision on hard, clay, and grass courts.',                         price:10999, category:'Tennis',     image:'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500&q=80', stock:11, rating:4.7 },
  { name:'Tennis Balls 3-Pack',     description:'ITF-approved high-visibility balls with a consistent, lively bounce for all court surfaces.',                                price:999,   category:'Tennis',     image:'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&q=80', stock:50, rating:4.6 },
  { name:'Adjustable Dumbbells',    description:'Space-saving 5–52.5 lb set with a quick-dial selector. Replace a full rack of 15 weight pairs.',                            price:24999, category:'Fitness',    image:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80', stock:8,  rating:4.8 },
  { name:'TPE Yoga Mat',            description:'6 mm thick eco-friendly mat with alignment lines, non-slip texture, and carry strap included.',                              price:2999,  category:'Fitness',    image:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80', stock:25, rating:4.5 },
  { name:'Resistance Bands Set',    description:'Set of 5 latex bands (10–50 lbs) with handles, ankle straps, and a door anchor. Great for home workouts.',                 price:1999,  category:'Fitness',    image:'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&q=80', stock:30, rating:4.4 },
  { name:'Racing Swimsuit',         description:'Chlorine-resistant polyester with compression panels and a hydrodynamic cut for maximum speed.',                             price:6499,  category:'Swimming',   image:'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=500&q=80', stock:14, rating:4.6 },
  { name:'Anti-Fog Swim Goggles',   description:'UV-protected wide-view goggles with a silicone gasket and adjustable split-strap for a leak-free fit.',                     price:1999,  category:'Swimming',   image:'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=500&q=80', stock:20, rating:4.7 },
];

async function seedProducts() {
  if (await Product.countDocuments() > 0) return;
  await Product.insertMany(SEED);
  console.log('✅  Products seeded');
}

/* ── GET /api/products ── */
router.get('/', async (req, res) => {
  try {
    await seedProducts();
    const { category, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search)   query.name = { $regex: search, $options: 'i' };
    const products = await Product.find(query);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/products/:id ── */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const related = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(4);
    res.json({ product, related });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

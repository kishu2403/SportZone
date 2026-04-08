require('dotenv').config();
const express      = require('express');
const mongoose     = require('mongoose');
const session      = require('express-session');
const MongoStore   = require('connect-mongo');
const path         = require('path');
const cors         = require('cors');

const app = express();

/* ─── MongoDB Connection ──────────────────────────────────── */
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => console.error('❌  MongoDB error:', err.message));

/* ─── Middleware ──────────────────────────────────────────── */
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve all static files from /public
app.use(express.static(path.join(__dirname, 'public')));

/* ─── Sessions (stored in MongoDB) ───────────────────────── */
app.use(session({
  secret: process.env.SESSION_SECRET || 'sportzone-secret-2024',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

/* ─── API Routes ──────────────────────────────────────────── */
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/shop'));
app.use('/api/cart',     require('./routes/cart'));

/* ─── Serve HTML pages ────────────────────────────────────── */
// All page routes return their HTML file
const pages = ['/', '/login', '/signup', '/cart', '/product', '/success', '/404'];

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login',   (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'login.html')));
app.get('/signup',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'signup.html')));
app.get('/cart',    (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'cart.html')));
app.get('/success', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'success.html')));
app.get('/product/:id', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'product.html')));

/* ─── 404 ─────────────────────────────────────────────────── */
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'pages', '404.html')));

/* ─── Start ───────────────────────────────────────────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀  SportZone running → http://localhost:${PORT}`)
);

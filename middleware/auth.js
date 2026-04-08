/* Returns 401 JSON if not logged in — used by API routes */
module.exports = function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  req.session.returnTo = req.originalUrl;
  res.status(401).json({ error: 'Login required', redirect: '/login' });
};

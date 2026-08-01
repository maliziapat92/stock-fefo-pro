const jwt = require('jsonwebtoken');

// Keep the same secret used in controllers/userController.js
const SECRET = "stock_fefo_secret_2026";

function extractToken(req) {
  const auth = req.headers.authorization || req.headers.Authorization || req.headers['x-access-token'];
  if (!auth) return null;
  if (auth.startsWith('Bearer ')) return auth.split(' ')[1];
  return auth;
}

function verifyToken(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide', error: err.message });
  }
}

function isAdmin(req, res, next) {
  // If verifyToken wasn't run first, try to decode token now
  const user = req.user;
  if (user) {
    if (user.role && (user.role === 'Administrateur' || user.role === 'Admin')) return next();
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
  }

  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role && (decoded.role === 'Administrateur' || decoded.role === 'Admin')) {
      req.user = decoded;
      return next();
    }
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide', error: err.message });
  }
}

module.exports = {
  verifyToken,
  isAdmin
};

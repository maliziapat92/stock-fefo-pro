const jwt = require('jsonwebtoken');

// Secret conservé (celui de controllers/userController.js)
const SECRET = "stock_fefo_secret_2026";

function extractToken(req) {
  const auth = req.headers.authorization || req.headers.Authorization || req.headers['x-access-token'];
  if (!auth) return null;
  if (auth.startsWith('Bearer ')) return auth.split(' ')[1];
  return auth;
}

// MODE DÉMO : laisse tout passer avec un utilisateur administrateur par défaut
function verifyToken(req, res, next) {
  req.user = { role: 'Administrateur', name: 'Démo' };
  next();
}

function isAdmin(req, res, next) {
  req.user = { role: 'Administrateur', name: 'Démo' };
  next();
}

module.exports = {
  verifyToken,
  isAdmin
};

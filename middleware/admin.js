const jwt = require('jsonwebtoken');
const config = require('config');

function admin(req, res, next) {
  // 403 Forbidden --> 
  if (!req.user.isAdmin) return res.status(403).send('Access denied');

  next();
}

module.exports = admin;
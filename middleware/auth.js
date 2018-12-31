const jwt = require('jsonwebtoken');
const config = require('config');

function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided');

  try {
    // jwt.verify will verify our jwt. If valid, it'll decode it 
    // and return our payload
    const decodedPayload = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decodedPayload;
    // by putting decodedPayload in req.user, we can access in our route handlers
    // like so: req.user._id
    
    next();
  }
  catch (ex) {
    res.status(400).send('Invalid token.');
  }
}

module.exports = auth;
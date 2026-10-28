const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'garage-secret-key';

const authenticateToken = (req, res, next) => {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({ success: false, message: 'Authentication is required' });
  }

  try {
    req.auth = jwt.verify(match[1], JWT_SECRET);
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

module.exports = authenticateToken;

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - No Token' });
  }

  try {
    // verify throws an error if token is invalid, so we need try/catch
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
  }
};

// CRITICAL: Export as an object to match "const { protect } = require(...)"
module.exports = { protect };
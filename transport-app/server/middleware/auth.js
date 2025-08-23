const { verifyToken } = require('../utils/auth');

exports.protect = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ msg: 'No token provided' });
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ msg: 'Invalid auth header' });
  }
  const token = parts[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }
  next();
};
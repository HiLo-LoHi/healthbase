const jwt = require('jsonwebtoken');

// Verify that the request contains a valid JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid or expired token.'
    });
  }
}

// Allow access only to administrators
function verifyAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied. Only administrators are authorized to perform this action.'
    });
  }

  next();
}

module.exports = {
  verifyToken,
  verifyAdmin
};
const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("❌ Missing or malformed Authorization Header");
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log(`❌ Token Verification Failed: ${err.message}`);
      const statusCode = err.name === 'TokenExpiredError' ? 401 : 403;
      return res.status(statusCode).json({ message: `Unauthorized: ${err.message}` });
    }

    console.log("🟢 Decoded Token:", decoded); // Log token payload

    if (!decoded.id || !decoded.role || !decoded.email) {
      console.log("❌ Required fields missing in token payload");
      return res.status(403).json({ message: 'Forbidden: Missing required user details in token' });
    }

    req.user = decoded; // Attach decoded user to request
    console.log("🟢 Authenticated User:", decoded);
    next();
  });
};

// ✅ Add the authorize function
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(`❌ User role '${req.user.role}' not authorized`);
      return res.status(403).json({ message: 'Forbidden: You do not have permission' });
    }
    console.log("🟢 User authorized");
    next();
  };
};

module.exports = { authenticateUser, authorize };



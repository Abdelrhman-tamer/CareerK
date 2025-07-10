// middlewares/normalizeUserContext.js

module.exports = (req, res, next) => {
  if (!req.user || !req.user.id || !req.user.role) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing user context' });
  }

  req.userId = req.user.id;
  req.userType = req.user.role.toLowerCase(); // Normalized role for use in DB queries, etc.

  next();
};

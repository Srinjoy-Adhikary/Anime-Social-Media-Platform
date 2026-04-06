const jwt = require("jsonwebtoken");

// ─── protect ─────────────────────────────────────────────────────────────────
// Verifies the short-lived access token from the cookie.
// Strictly returns JSON/HTTP error codes for SPA/React consumption.
const protect = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    // Access token may have expired — tell the client to refresh
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });
    }
    // Any other token error (tampered, malformed, etc.)
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// ─── authorizeRoles ───────────────────────────────────────────────────────────
// Usage: router.delete("/post/:id", protect, authorizeRoles("admin"), deletePost)
// Pass one or more allowed roles as arguments.
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(", ")}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
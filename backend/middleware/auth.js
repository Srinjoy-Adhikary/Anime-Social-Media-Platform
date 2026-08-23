const jwt = require("jsonwebtoken");

// ─── protect ─────────────────────────────────────────────────────────────────
// Verifies the access token from Authorization header or cookie.
// Strictly returns JSON/HTTP error codes for SPA/React consumption.
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    (authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null) ||
    req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
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
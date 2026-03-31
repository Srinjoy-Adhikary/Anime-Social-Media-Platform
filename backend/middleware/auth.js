const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  // 1. Grab the token from the HTTP-Only cookie
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // 2. Decode the token to get the user ID
    const decoded = jwt.verify(token, "secretkey"); // Use your actual secret key
    
    // 3. Attach the secure ID to the request object for the controller to use
    req.user = decoded; 
    
    next(); // Pass the request to the controller
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };
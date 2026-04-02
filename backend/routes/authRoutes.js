const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { registerUser, loginUser, logoutUser, refreshToken } = require("../controllers/authController");

// ─── Rate Limiters ────────────────────────────────────────────────────────────

// Strict limiter for login — slows down brute force attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15-minute window
  max: 10,                    // Max 10 attempts per IP per window
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Looser limiter for registration — prevents mass account creation
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1-hour window
  max: 5,                     // Max 5 registrations per IP per hour
  message: { message: "Too many accounts created from this IP. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ───────────────────────────────────────────────────────────────────
router.post("/register", registerLimiter, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshToken); // Called automatically by the frontend when access token expires

module.exports = router;

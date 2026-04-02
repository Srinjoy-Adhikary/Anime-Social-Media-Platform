const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ─── Regex Validators ───────────────────────────────────────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{8,}$/;
// Password rules: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char

// ─── Token Helpers ───────────────────────────────────────────────────────────
const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // Short-lived access token
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" } // Long-lived refresh token
  );

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth/refresh", // Scoped — only sent to the refresh endpoint
  });
};

// ─── Register ────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 2. Validate password strength
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@$!%*?&^#)",
      });
    }

    // 3. Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds for stronger hashing
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: "user", // Default role — change manually in DB to make admins
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────
// Lockout constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Basic format check before hitting the DB
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" }); // Vague on purpose

    // 2. Account lockout check
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({
        message: `Account locked. Try again in ${minutesLeft} minute(s).`,
      });
    }

    // 3. Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        user.failedLoginAttempts = 0; // Reset counter after locking
        await user.save();
        return res.status(403).json({
          message: "Too many failed attempts. Account locked for 15 minutes.",
        });
      }

      await user.save();
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 4. Successful login — reset lockout fields
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // 5. Issue tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setTokenCookies(res, accessToken, refreshToken);

    res.json({
      message: "Login successful",
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Refresh Token ───────────────────────────────────────────────────────────
const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Issue a brand-new access token (refresh token stays the same)
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed" });
  } catch (error) {
    // Refresh token is invalid or expired — force re-login
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    return res.status(403).json({ message: "Session expired. Please log in again." });
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────
const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  res.json({ message: "Logged out successfully" });
};

module.exports = { registerUser, loginUser, logoutUser, refreshToken };

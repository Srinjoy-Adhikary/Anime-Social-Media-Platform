const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User (unchanged)
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login User (Updated for Cookies)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id },
      "secretkey", // (Make sure to move this to your .env file eventually!)
      { expiresIn: "1d" }
    );

    // ✅ Set the HTTP-Only Cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript from reading the cookie (Huge security boost!)
      secure: process.env.NODE_ENV === "production", // Requires HTTPS in production
      sameSite: "strict", // Prevents CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 1 Day in milliseconds
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ NEW: Logout User Controller
const logoutUser = (req, res) => {
  // Overwrite the cookie with a blank token that expires instantly
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  
  res.json({ message: "Logged out successfully" });
};

module.exports = { registerUser, loginUser, logoutUser };
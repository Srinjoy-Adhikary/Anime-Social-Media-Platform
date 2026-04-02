const User = require("../models/User");
const bcrypt = require("bcrypt"); // Or 'bcryptjs' depending on what you used for registration

// @desc    Get user profile
// @route   GET /api/users/:id
const getUserProfile = async (req, res) => {
  try {
    // We use .select('-password') to ensure we never send the hashed password to the frontend
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query; 
    if (!q) return res.json([]);

    // The $regex and $options: "i" make sure "Luffy", "luffy", and "LUFFY" all work
    const users = await User.find({
      username: { $regex: q, $options: "i" }
    })
    .select("_id username avatar bio") // Only send safe public data!
    .limit(10); 

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Add this inside userController.js
const getMe = async (req, res) => {
  try {
    // Notice we use req.user.id (from the cookie), NOT req.params.id (from the URL)
    const user = await User.findById(req.user.id).select("-password"); // Hide the password hash!
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
       if (req.user.id !== req.params.id) {
  return res.status(403).json({ message: "Not authorized" });
}
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Update basic fields (Fall back to existing data if nothing was passed)
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    
    // Using !== undefined for bio and avatar allows users to clear them out completely if they want
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

    // 2. Safely handle password updates
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    // 3. Save the updated user to the database
    const updatedUser = await user.save();

    // 4. Send back the updated user (again, stripping out the password)
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      watchlist: updatedUser.watchlist,
    });
    
  } catch (error) {
    console.error("Update Profile Error:", error);
    // Handle MongoDB duplicate key error (e.g., someone tries to take an existing username)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username or email is already taken" });
    }
    res.status(500).json({ message: "Server error updating profile" });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,getMe,searchUsers,getAllUsers
};
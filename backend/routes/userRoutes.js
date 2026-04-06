const express = require("express");
const router = express.Router();
const {
  searchUsers,
  getUserProfile,
  updateUserProfile,
  getMe,
  getAllUsers,   // admin-only example
} = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/auth");
const { uploadAvatar } = require("../middleware/upload");

// ─── Specific Routes (These MUST come first) ──────────────────────────────────
router.get("/search", searchUsers);

// Protected: Get logged-in user's own profile
router.get("/me", protect, getMe);

// Admin: Get all users
router.get("/admin/all", protect, authorizeRoles("admin"), getAllUsers);


// ─── Dynamic Routes (These MUST come last) ────────────────────────────────────
// Public: Get another user's profile by their ID
router.get("/:id", getUserProfile);

// Protected: Update a user's profile (handles both file upload and URL string)
router.put("/:id", protect, uploadAvatar.single("avatarFile"), updateUserProfile);

module.exports = router;

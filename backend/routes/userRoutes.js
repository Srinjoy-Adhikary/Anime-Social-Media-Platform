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

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get("/search", searchUsers);
router.get("/:id", getUserProfile);

// ─── Protected Routes (any logged-in user) ────────────────────────────────────
router.get("/me", protect, getMe);
router.put("/:id", protect, updateUserProfile);

// ─── Admin-Only Routes ────────────────────────────────────────────────────────
// Only users whose `role` field in the DB is "admin" can access these.
// Example: GET /api/users/admin/all  →  returns every user (for an admin dashboard)
router.get("/admin/all", protect, authorizeRoles("admin"), getAllUsers);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  searchUsers,
  getUserProfile,
  updateUserProfile,
  getMe,
  getAllUsers,  
} = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/auth");
const { uploadAvatar } = require("../middleware/upload");

router.get("/search", searchUsers);

// Protected: Get logged-in user's own profile
router.get("/me", protect, getMe);

router.get("/admin/all", protect, authorizeRoles("admin"), getAllUsers);


// Public: Get another user's profile by their ID
router.get("/:id", getUserProfile);


router.put("/:id", protect, uploadAvatar.single("avatarFile"), updateUserProfile);

module.exports = router;

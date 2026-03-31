const express = require("express");
const router = express.Router();
const {searchUsers, getUserProfile, updateUserProfile, getMe} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// The /:id handles the dynamic user ID being passed from the frontend
router.get("/search", searchUsers);
router.get("/me", protect, getMe);
router.get("/:id", getUserProfile);
router.put("/:id", protect, updateUserProfile);

module.exports = router;


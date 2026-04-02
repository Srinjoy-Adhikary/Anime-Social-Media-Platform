const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ""
  },
  avatar: {
    type: String,
    default: ""
  },  role: {
    type: String,
    enum: ["user", "moderator", "admin"],
    default: "user",
  },

  // ── Account Lockout ──
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
 watchlist: [
 {
  animeId: Number,
  title: String,
  image: String,
  genres: [String],
  status: {
   type: String,
   enum: ["watching","completed","plan_to_watch","dropped"],
   default: "watching"
  }
 }
]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
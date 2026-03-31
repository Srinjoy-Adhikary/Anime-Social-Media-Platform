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
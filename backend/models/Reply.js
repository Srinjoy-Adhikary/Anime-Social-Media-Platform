const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  discussionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Discussion",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  content: {
    type: String,
    required: true
  },
  parentReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reply",
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Reply", replySchema);
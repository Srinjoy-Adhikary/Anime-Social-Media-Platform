const express = require("express");
const router = express.Router();

const {
  createDiscussion,
  getPostDiscussions,
  addReply,
  getReplies,
  deleteReply
} = require("../controllers/discussionController");

router.post("/create", createDiscussion);

router.get("/post/:postId", getPostDiscussions);

router.post("/reply", addReply);
router.delete("/delete", deleteReply);

router.get("/replies/:discussionId", getReplies);

module.exports = router;
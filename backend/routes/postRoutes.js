const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const Post = require("../models/Post");

const { uploadPost } = require("../middleware/upload");
const {createPost,getFeed,reactToPost,getSmartFeed} = require("../controllers/postController");

router.post("/", uploadPost.single("image"), createPost);
router.get("/feed/:userId", getFeed);
router.post("/:postId/react", reactToPost);
router.get("/smartfeed/:userId", getSmartFeed);
router.get("/", async (req,res)=>{
  const posts = await Post.find();
  res.json(posts);
});


module.exports = router;
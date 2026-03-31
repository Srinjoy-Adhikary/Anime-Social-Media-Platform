const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const Post = require("../models/Post");


const {createPost,getFeed,reactToPost,getSmartFeed} = require("../controllers/postController");
router.post("/", upload.single("image"), createPost);
router.get("/feed/:userId", getFeed);
router.post("/:postId/react", reactToPost);
router.get("/smartfeed/:userId", getSmartFeed);
router.get("/", async (req,res)=>{
  const posts = await Post.find();
  res.json(posts);
});

module.exports = router;
const Post = require("../models/Post");
const User = require("../models/User");
const Discussion = require("../models/Discussion")

const createPost = async (req, res) => {
  try {
    const { title, content, anime, spoiler, userId } = req.body;
    // req.file.path is now the Cloudinary URL (not a local path)
    const image = req.file ? req.file.path : "";

    const post = new Post({ title, content, anime, spoiler, image, user: userId });
    await post.save();

    const populatedPost = await Post.findById(post._id).populate("user", "username");
    res.json(populatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📊 2. NORMAL FEED
const getFeed = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Using .lean() makes the data a plain JS object immediately
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "username")
      .lean(); 

    const feed = posts.map(post => {
      // 📝 BACKEND LOG: Check your Terminal (not browser console)
      console.log(`[BACKEND] Post: ${post.title} | User:`, post.user);

      const animeEntry = user.watchlist.find(a => a.title === post.anime);
      let hidden = false;
      if (post.spoiler) {
        if (!animeEntry || animeEntry.status !== "completed") {
          hidden = true;
        }
      }

      return { ...post, hidden };
    });

    res.json(feed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🧠 3. SMART FEED
const getSmartFeed = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "username")
      .lean(); // 🔥 FIXED: Added .lean()

    const discussions = await Discussion.find();
    const watchlist = user.watchlist.map(a => a.title);
    const userGenres = user.watchlist.flatMap(a => a.genres || []);

    const feed = posts.map(post => {
      let score = 0;
      if (watchlist.includes(post.anime)) score += 10;
      if (post.genres) {
        const matches = post.genres.filter(g => userGenres.includes(g)).length;
        score += matches * 3;
      }
      
      const reactions = post.reactions || {};
      const totalReactions = (reactions.peak || 0) + (reactions.sad || 0) + (reactions.shock || 0) + (reactions.mindblown || 0) + (reactions.love || 0);
      score += totalReactions * 2;

      const discussionCount = discussions.filter(d => d.postId?.toString() === post._id.toString()).length;
      score += discussionCount;

      const hoursOld = (Date.now() - new Date(post.createdAt)) / (1000 * 60 * 60);
      score += Math.max(0, 5 - hoursOld);

      return { ...post, score };
    });

    feed.sort((a, b) => b.score - a.score);
    res.json(feed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const reactToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, reaction } = req.body;
    const allowedReactions = ["peak", "sad", "shock", "mindblown", "love"];
    if (!allowedReactions.includes(reaction)) return res.status(400).json({ message: "Invalid reaction" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existingReaction = post.reactionUsers.find(r => r.userId === userId);
    if (existingReaction) {
      post.reactions[existingReaction.reaction] -= 1;
      existingReaction.reaction = reaction;
    } else {
      post.reactionUsers.push({ userId, reaction });
    }
    post.reactions[reaction] += 1;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPost, getFeed, reactToPost, getSmartFeed };
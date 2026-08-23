const User = require("../models/User");

const addToWatchlist = async (req, res) => {
  try {
    // 1. Extract userId from authenticated session (protect middleware) or fallback to body
    const userId = req.user?.id || req.body.userId;
    const { animeId, title, image, genres, status } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "User ID missing or unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.watchlist) user.watchlist = [];

    // 2. Type-safe match to check if anime already exists
    const existingAnimeIndex = user.watchlist.findIndex(
      (anime) => String(anime.animeId) === String(animeId)
    );

    if (existingAnimeIndex !== -1) {
      // Update status if already in list
      user.watchlist[existingAnimeIndex].status = status || "plan_to_watch";
    } else {
      // Push new anime entry
      user.watchlist.push({
        animeId,
        title,
        image: image || "",
        genres: Array.isArray(genres) ? genres : [],
        status: status || "plan_to_watch",
      });
    }

    await user.save();

    res.json({
      message: "Watchlist updated successfully",
      watchlist: user.watchlist,
    });
  } catch (error) {
    console.error("addToWatchlist Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getWatchlist = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.watchlist || []);
  } catch (error) {
    console.error("getWatchlist Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { animeId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "User ID missing or unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.watchlist = (user.watchlist || []).filter(
      (anime) => String(anime.animeId) !== String(animeId)
    );

    await user.save();

    res.json({
      message: "Anime removed from watchlist",
      watchlist: user.watchlist,
    });
  } catch (error) {
    console.error("removeFromWatchlist Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
};
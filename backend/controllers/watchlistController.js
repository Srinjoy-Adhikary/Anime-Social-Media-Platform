const User = require("../models/User");

const addToWatchlist = async (req, res) => {
  try {
    // 1. Destructure the missing image and genres fields
    const { userId, animeId, title, image, genres, status } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2. Check if the anime is already in the watchlist
    const existingAnimeIndex = user.watchlist.findIndex(
      (anime) => anime.animeId === animeId
    );

    if (existingAnimeIndex !== -1) {
      // If it exists, just update the status (prevents duplicates)
      user.watchlist[existingAnimeIndex].status = status;
    } else {
      // If it's new, push the full object including image and genres
      user.watchlist.push({
        animeId,
        title,
        image,
        genres,
        status
      });
    }

    await user.save();

    res.json({
      message: "Watchlist updated successfully",
      watchlist: user.watchlist
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWatchlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.watchlist);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const { userId, animeId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Filter out the anime to remove it
    user.watchlist = user.watchlist.filter(
      (anime) => anime.animeId !== animeId
    );

    await user.save();

    res.json({
      message: "Anime removed from watchlist",
      watchlist: user.watchlist
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist
};
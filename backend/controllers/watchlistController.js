const User = require("../models/User");

const addToWatchlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    const {
      animeId,
      title,
      image,
      genres,
      status,
      totalEpisodes
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: "User ID missing or unauthorized"
      });
    }

    if (!animeId || !title) {
      return res.status(400).json({
        error: "animeId and title are required"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    if (!user.watchlist) {
      user.watchlist = [];
    }

    const existingAnimeIndex = user.watchlist.findIndex(
      (anime) => String(anime.animeId) === String(animeId)
    );

    if (existingAnimeIndex !== -1) {
      // Update existing anime
      user.watchlist[existingAnimeIndex].status =
        status || "plan_to_watch";

      if (totalEpisodes !== undefined) {
        user.watchlist[existingAnimeIndex].totalEpisodes =
          Number(totalEpisodes) || 0;
      }

    } else {
      // Add new anime
      user.watchlist.push({
        animeId,
        title,
        image: image || "",
        genres: Array.isArray(genres) ? genres : [],
        status: status || "plan_to_watch",
        currentEpisode: 0,
        totalEpisodes: Number(totalEpisodes) || 0
      });
    }

    await user.save();

    res.json({
      message: "Watchlist updated successfully",
      watchlist: user.watchlist
    });

  } catch (error) {
    console.error(
      "addToWatchlist Error:",
      error.message
    );

    res.status(500).json({
      error: error.message
    });
  }
};


const getWatchlist = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        error: "User ID required"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json(user.watchlist || []);

  } catch (error) {
    console.error(
      "getWatchlist Error:",
      error.message
    );

    res.status(500).json({
      error: error.message
    });
  }
};


const updateEpisodeProgress = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    const {
      animeId,
      currentEpisode
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: "User ID missing or unauthorized"
      });
    }

    if (
      currentEpisode === undefined ||
      Number(currentEpisode) < 0
    ) {
      return res.status(400).json({
        error: "Invalid episode number"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    const anime = user.watchlist.find(
      (anime) =>
        String(anime.animeId) === String(animeId)
    );

    if (!anime) {
      return res.status(404).json({
        error: "Anime not found in watchlist"
      });
    }

    const episode = Number(currentEpisode);

    // Prevent going beyond total episodes
    if (
      anime.totalEpisodes > 0 &&
      episode > anime.totalEpisodes
    ) {
      return res.status(400).json({
        error: `Maximum episode is ${anime.totalEpisodes}`
      });
    }

    anime.currentEpisode = episode;

    await user.save();

    res.json({
      message: "Episode progress updated",
      anime
    });

  } catch (error) {
    console.error(
      "updateEpisodeProgress Error:",
      error.message
    );

    res.status(500).json({
      error: error.message
    });
  }
};


const removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    const { animeId } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: "User ID missing or unauthorized"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    user.watchlist = (user.watchlist || []).filter(
      (anime) =>
        String(anime.animeId) !== String(animeId)
    );

    await user.save();

    res.json({
      message: "Anime removed from watchlist",
      watchlist: user.watchlist
    });

  } catch (error) {
    console.error(
      "removeFromWatchlist Error:",
      error.message
    );

    res.status(500).json({
      error: error.message
    });
  }
};


module.exports = {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  updateEpisodeProgress
};
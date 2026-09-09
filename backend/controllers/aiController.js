const User = require("../models/User");

const askAnimeAI = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    const { animeId, question } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: "User ID missing or unauthorized"
      });
    }

    if (!animeId || !question) {
      return res.status(400).json({
        error: "animeId and question are required"
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    // Find anime in watchlist
    const anime = user.watchlist.find(
      (item) => String(item.animeId) === String(animeId)
    );

    if (!anime) {
      return res.status(404).json({
        error: "Anime not found in watchlist"
      });
    }

    const currentEpisode = anime.currentEpisode || 0;

    // Send request to Python RAG service
    const response = await fetch(
      "http://127.0.0.1:8000/ask",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question,
          currentEpisode,
          anime: anime.title
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "AI service error:",
        errorText
      );

      return res.status(502).json({
        error: "AI service unavailable"
      });
    }

    const data = await response.json();

    res.json({
      answer: data.answer,
      anime: anime.title,
      currentEpisode
    });

  } catch (error) {
    console.error(
      "askAnimeAI Error:",
      error.message
    );

    res.status(500).json({
      error: "Failed to get AI response"
    });
  }
};

module.exports = {
  askAnimeAI
};
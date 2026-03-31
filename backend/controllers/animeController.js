const axios = require("axios");

const searchAnime = async (req, res) => {
  try {
    const { q } = req.query;

    // 1. Guard clause: Prevent empty searches from hitting the API
    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const response = await axios.get(
      `https://api.jikan.moe/v4/anime?q=${q}&limit=20`
    );

    // 2. Bulletproof the mapping with optional chaining and fallbacks
    let animeList = response.data.data.map(anime => ({
      mal_id: anime.mal_id,
      title: anime.title,
      image: anime.images?.jpg?.image_url || "", // Fallback if no image
      episodes: anime.episodes || "?",           // Fallback if ongoing/unknown
      score: anime.score || "N/A",
      year: anime.year || "Unknown",
      type: anime.type || "Unknown",
      genres: anime.genres ? anime.genres.map(g => g.name) : []
    }));

    // 3. TV first, then Movie/OVA (Slightly refined to prevent TV vs TV swapping)
    animeList.sort((a, b) => {
      if (a.type === "TV" && b.type !== "TV") return -1;
      if (b.type === "TV" && a.type !== "TV") return 1;
      return 0;
    });

    res.json(animeList);

  } catch (error) {
    console.error("Jikan API Error:", error.message);
    res.status(500).json({ message: "Failed to fetch anime" });
  }
};

module.exports = { searchAnime };
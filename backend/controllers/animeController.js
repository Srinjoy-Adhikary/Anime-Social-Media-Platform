const axios = require("axios");

const searchAnime = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(200).json([]);
    }

    const response = await axios.get(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q.trim())}&limit=20&sfw=true`,
      {
        timeout: 6000,
        headers: {
          "User-Agent": "AnimeSocialMediaApp/1.0",
          Accept: "application/json",
        },
      }
    );

    const items = response.data?.data;
    if (!Array.isArray(items)) {
      return res.status(200).json([]);
    }

    let animeList = items.map((anime) => ({
      mal_id: anime.mal_id,
      title: anime.title_english || anime.title || "Unknown Title",
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "",
      episodes: anime.episodes || "?",
      score: anime.score || "N/A",
      year: anime.year || "Unknown",
      type: anime.type || "Unknown",
      genres: Array.isArray(anime.genres) ? anime.genres.map((g) => g.name) : [],
    }));

    // TV first, then Movie/OVA
    animeList.sort((a, b) => {
      if (a.type === "TV" && b.type !== "TV") return -1;
      if (b.type === "TV" && a.type !== "TV") return 1;
      return 0;
    });

    return res.status(200).json(animeList);
  } catch (error) {
    console.error("Jikan API Error:", error.response?.data?.message || error.message);
    
    // Return empty array with 200 so the frontend search box fails gracefully instead of crashing
    return res.status(200).json([]);
  }
};

module.exports = { searchAnime };
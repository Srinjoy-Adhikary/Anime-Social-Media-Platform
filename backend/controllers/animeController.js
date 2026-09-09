
const axios = require("axios");

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const KITSU_API = "https://kitsu.io/api/edge";

// Search anime using Kitsu
const searchAnime = async (req, res) => {
  const q = req.query.q?.trim();

  if (!q) {
    return res.status(200).json([]);
  }

  const cacheKey = q.toLowerCase();

  // Check cache
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.status(200).json(cached.data);
  }

  try {
    const response = await axios.get(
      `${KITSU_API}/anime`,
      {
        params: {
          "filter[text]": q,
          "page[limit]": 15,
          "page[offset]": 0,
        },
        headers: {
          Accept: "application/vnd.api+json",
        },
        timeout: 7000,
      }
    );

    const items = response.data?.data || [];

    const results = items.map((anime) => {
      const attributes = anime.attributes || {};

      const titles = attributes.titles || {};

      return {
        // Keep mal_id name so existing frontend doesn't break
        mal_id: anime.id,

        title:
          titles.en ||
          titles.en_jp ||
          titles.ja_jp ||
          attributes.canonicalTitle ||
          "Unknown Title",

        image:
          attributes.posterImage?.large ||
          attributes.posterImage?.medium ||
          attributes.posterImage?.small ||
          "",

        episodes: attributes.episodeCount || "?",

        score: attributes.averageRating
          ? (Number(attributes.averageRating) / 10).toFixed(1)
          : "N/A",

        year: attributes.startDate
          ? new Date(attributes.startDate).getFullYear()
          : "Unknown",

        type: attributes.subtype || "Unknown",

        genres: [],

        // Useful for future AI/RAG integration
        kitsu_id: anime.id,

        synopsis: attributes.synopsis || "",

        status: attributes.status || "unknown",

        episodeLength: attributes.episodeLength || null,

        startDate: attributes.startDate || null,

        endDate: attributes.endDate || null,
      };
    });

    cache.set(cacheKey, {
      data: results,
      timestamp: Date.now(),
    });

    return res.status(200).json(results);

  } catch (error) {
    console.error(
      "Kitsu anime search failed:",
      error.response?.data || error.message
    );

    // Don't crash frontend
    return res.status(200).json([]);
  }
};

module.exports = {
  searchAnime,
};


const axios = require("axios");

// Simple in-memory cache to reduce external API hits
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const searchAniListFallback = async (query) => {
  const graphqlQuery = {
    query: `
      query ($search: String) {
        Page(page: 1, perPage: 15) {
          media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
            episodes
            averageScore
            seasonYear
            format
            genres
          }
        }
      }
    `,
    variables: { search: query },
  };

  const response = await axios.post(
    "https://graphql.anilist.co",
    graphqlQuery,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 5000,
    }
  );

  const list = response.data?.data?.Page?.media || [];
  return list.map((item) => ({
    mal_id: item.id,
    title: item.title.english || item.title.romaji || "Unknown Title",
    image: item.coverImage?.large || "",
    episodes: item.episodes || "?",
    score: item.averageScore ? (item.averageScore / 10).toFixed(1) : "N/A",
    year: item.seasonYear || "Unknown",
    type: item.format || "TV",
    genres: item.genres || [],
  }));
};

const searchAnime = async (req, res) => {
  const q = req.query.q?.trim();

  if (!q) {
    return res.status(200).json([]);
  }

  const cacheKey = q.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.status(200).json(cached.data);
  }

  // 1. Try Jikan API
  try {
    const response = await axios.get(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=15&sfw=true`,
      {
        timeout: 4500,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
      }
    );

    const items = response.data?.data;
    if (Array.isArray(items) && items.length > 0) {
      const results = items.map((anime) => ({
        mal_id: anime.mal_id,
        title: anime.title_english || anime.title || "Unknown Title",
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "",
        episodes: anime.episodes || "?",
        score: anime.score || "N/A",
        year: anime.year || "Unknown",
        type: anime.type || "Unknown",
        genres: Array.isArray(anime.genres) ? anime.genres.map((g) => g.name) : [],
      }));

      cache.set(cacheKey, { data: results, timestamp: Date.now() });
      return res.status(200).json(results);
    }
  } catch (jikanErr) {
    console.warn("Jikan failed, switching to AniList fallback:", jikanErr.message);
  }

  // 2. Secondary Fallback: AniList API
  try {
    const aniListResults = await searchAniListFallback(q);
    cache.set(cacheKey, { data: aniListResults, timestamp: Date.now() });
    return res.status(200).json(aniListResults);
  } catch (aniListErr) {
    console.error("AniList fallback failed:", aniListErr.message);
    // Never send 500 — respond with empty array so UI does not crash
    return res.status(200).json([]);
  }
};

module.exports = { searchAnime };
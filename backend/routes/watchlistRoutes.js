const express = require("express");
const router = express.Router();

const {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  updateEpisodeProgress
} = require("../controllers/watchlistController");

router.post("/add", addToWatchlist);
router.get("/:userId", getWatchlist);
router.delete("/remove", removeFromWatchlist);
router.put("/progress", updateEpisodeProgress);

module.exports = router;
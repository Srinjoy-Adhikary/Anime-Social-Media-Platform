const express = require("express");
const router = express.Router();

const {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist
} = require("../controllers/watchlistController");

router.post("/add", addToWatchlist);
router.get("/:userId", getWatchlist);
router.delete("/remove", removeFromWatchlist);

module.exports = router;
const express = require("express");
const router = express.Router();

const { searchAnime } = require("../controllers/animeController");

router.get("/search", searchAnime);

module.exports = router;
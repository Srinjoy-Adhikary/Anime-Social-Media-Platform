const express = require("express");

const router = express.Router();

const {
  askAnimeAI
} = require("../controllers/aiController");

router.post("/ask", askAnimeAI);

module.exports = router;
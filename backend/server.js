require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const animeRoutes = require("./routes/animeRoutes");const discussionRoutes = require("./routes/discussionRoutes");
const userRoutes = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
// Add this in your backend server.js
const path = require('path');






const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());
// Remove the old app.use(cors()); and replace it with this:
app.use(
  cors({
    origin: ["http://localhost:5173", "http://10.120.119.104:5173"], // Your React app's exact URL
    credentials: true, // This is the magic switch that allows cookies to pass through!
  })
);
app.use(express.json()); // This is required to parse req.body!
app.use("/api/posts",postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/watchlist",watchlistRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/anime", animeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/discussions",discussionRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get("/", (req, res) => {
  res.send("Anime Social Media API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const animeRoutes = require("./routes/animeRoutes");
const discussionRoutes = require("./routes/discussionRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// 1. Database Connection
connectDB();

// 2. Reverse Proxy Trust (Required for Render/Railway load balancers & secure cookies)
app.set("trust proxy", 1);

// 3. Dynamic CORS Setup (Supports localhost, main domain, and all Vercel preview URLs)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  "https://anime-social-media-platform.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      // Check against explicit origins OR any *.vercel.app domain
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 4. Core Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 5. Static Uploads Directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 6. API Route Handlers
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/anime", animeRoutes);

// 7. Base Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Anime Social Media API is running cleanly in production",
  });
});

// 8. Server Listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});
# 🎬 Anime Social Media Platform

A full‑stack anime-focused social platform where users share posts, react, and avoid spoilers intelligently based on their personal watchlists. The app provides a personalized spoiler-safe experience by blurring or hiding spoiler content until the user has finished the related anime or explicitly reveals it.

---

## 🚀 Highlights

- Smart Spoiler Protection: Blurs or hides spoiler content based on each user's watchlist and completion status.
- Watchlist System: Track anime as Watching, Completed, or Plan to Watch.
- Discussion Threads: Comment and discuss posts with the community.
- Reactions: Quick expressive reactions (Peak, Sad, Shock, Mindblown, Love).
- Secure Authentication: JWT-based login and signup flows.
- Image Uploads: Supports images via Cloudinary.

---

## Demo / Screenshot

> Add a link to a live demo or include screenshots/GIFs here to showcase the app.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Install & Run](#install--run)
- [Project Structure](#-project-structure)
- [How Spoiler Protection Works](#how-spoiler-protection-works)
- [API Summary](#api-summary)
- [Contributing](#contributing)
- [License & Contact](#license--contact)

---

## 🧾 Features

- Smart Spoiler Protection (per-user)
  - Spoilers are blurred by default for content that would spoil an anime a user hasn't completed.
  - Users can reveal spoilers manually.
- Watchlist management (Watching, Completed, Plan to Watch)
- Post creation with optional spoiler tagging
- Threaded comments for discussions
- Reaction system with multiple reaction types
- Image upload using Cloudinary
- Authentication and authorization using JWT
- Responsive React frontend (Vite) and Node/Express backend with MongoDB

---

## 🛠 Tech Stack

- Frontend: React + Vite, CSS
- Backend: Node.js, Express.js
- Database: MongoDB
- Image storage: Cloudinary
- Authentication: JWT

---

## 🧭 Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- MongoDB instance (Atlas or local)
- Cloudinary account (for image uploads)

### Environment Variables

Create a .env file in the backend root (and .env.local for frontend if needed). Example environment variables:

```
# Backend
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/anime-social?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend (optional)
VITE_API_URL=http://localhost:5000/api
```

> Keep secrets out of version control. Use environment configuration for deployments (Heroku, Vercel, Railway, etc.).

### Install & Run

From the repository root:

1. Install dependencies for backend:
```bash
cd backend
npm install
```

2. Install dependencies for frontend:
```bash
cd ../frontend
npm install
```

3. Run development servers (example using npm run dev):
- Backend:
```bash
cd backend
npm run dev
```
- Frontend:
```bash
cd frontend
npm run dev
```

Build for production:
- Frontend:
```bash
cd frontend
npm run build
```
- Backend: ensure production start script is defined, then run
```bash
NODE_ENV=production node server.js
```

(Adjust commands to match your package.json scripts.)

---

## 📂 Project Structure (high-level)

- backend/ — Express server, API routes, models, middleware
  - controllers/
  - models/
  - routes/
  - middleware/
  - utils/
- frontend/ — React + Vite app
  - src/
    - components/
    - pages/
    - services/
    - hooks/
- README.md — this file

> Update this section with actual file names and brief descriptions if you want the README to list exact paths.

---

## 🔒 How Spoiler Protection Works

1. Posts can be marked as containing spoilers.
2. Each user has a watchlist with per-anime completion status.
3. When rendering posts containing spoilers:
   - If the user has marked the anime as Completed → show content normally.
   - Otherwise → blur or hide the spoiler; the user can click "Reveal" to view it.
4. Spoiler detection may also use tags or metadata tied to each post.

This ensures personalized, context-aware spoiler protection across the app.

---

## 📡 API Summary (examples)

- POST /api/auth/register — Register a new user
- POST /api/auth/login — Login and receive JWT
- GET /api/posts — Get posts (paginated)
- POST /api/posts — Create a post (supports images & spoiler flag)
- POST /api/posts/:id/reaction — Add a reaction
- POST /api/watchlist — Add/update a watchlist entry
- POST /api/comments — Create comments / threads

(Replace or expand this list with your actual endpoints and request/response examples.)

---

## ✅ Testing & Seeding

- Add instructions for any test commands (e.g., `npm test`).
- If you have a seeding script to populate demo data, document how to run it (e.g., `npm run seed`).

---

## 🤝 Contributing

Contributions are welcome!

- Fork the repo
- Create a feature branch: `git checkout -b feat/my-feature`
- Commit changes: `git commit -m "feat: add ..."`
- Push and open a pull request

Include a short note about code style, typical PR size, and how you prefer issues to be filed (bug, enhancement, question).

---

## 📜 License

Add your license here (e.g., MIT). If you don't want to include a license, mention the default restrictions.

---

## 📫 Contact

Maintainer: Srinjoy Adhikary  
Repo: Srinjoy-Adhikary/Anime-Social-Media-Platform

For questions, feature suggestions, or help with setup — open an issue or contact me on GitHub.

---
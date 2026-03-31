import { useState } from "react";
import axios from "axios";
import "./PostCard.css";

const DemonSlayerPostCard = ({ post, updatePost, setSelectedPost, watchlist, setWatchlist }) => {
  const [showSpoiler, setShowSpoiler] = useState(false);

  // console.log(watchlist)
  // console.log(post)
 const normalize = (str) => str?.toLowerCase().trim();

const hasCompletedAnime = watchlist?.some(
  (item) =>
    normalize(item.title) === normalize(post.anime) &&
    item.status === "completed"
);

const isInWatchlist = watchlist?.some(
  (item) =>
    normalize(item.title) === normalize(post.anime)
);

const isSpoiler = post.spoiler;

// 🔥 FINAL LOGIC
const needsBlur =
  (isSpoiler || isInWatchlist) && !hasCompletedAnime && !showSpoiler;
  
  const handleReaction = async (emoji) => {
    try {
      const userId = localStorage.getItem("userId");

      // Make sure 'emoji' matches one of: "peak", "sad", "shock", "mindblown", "love"
      const res = await axios.post(`/api/posts/${post._id}/react`, {
        userId: userId,
        reaction: emoji
      });

      updatePost(res.data);
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith('http')) return imagePath;

    // Ensures there is exactly one slash between the port and the path
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `http://localhost:5000${cleanPath}`;
  };

  const breathingStyles = ["water", "flame", "thunder", "wind", "stone"];

  // Use a better hash that combines multiple characters
  const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const styleIndex = hashCode(post._id || Math.random().toString()) % breathingStyles.length;
  const breathingClass = breathingStyles[styleIndex];

  return (
    <article className={`demon-post-card demon-post-card--${breathingClass}`}>
      {/* Breathing effect background */}
      <div className="demon-post__aura" aria-hidden="true" />

      {/* Header with breathing style badge */}
      <header className="demon-post__header">
        <div className="demon-post__breathing">
          <span className="breathing-badge">{breathingClass.toUpperCase()}</span>
          {post.user?.username && (
            <span className="demon-post__author">
              {post.user?.username || "unknown"}
            </span>
          )}
        </div>
        {isSpoiler && (
          <span className="spoiler-badge">⚠️ SPOILER</span>
        )}
      </header>

      {/* Content wrapper with Smart Spoiler blur */}
      <div className="demon-post__content-wrap">
        {needsBlur && (
          <div className="demon-post__spoiler-overlay">
            <p>呪いを浴びる…</p>
            <button
              className="demon-post__reveal-btn"
              onClick={() => setShowSpoiler(true)}
            >
              Reveal Spoiler
            </button>
          </div>
        )}

        <div className={`demon-post__body ${needsBlur ? "demon-post__body--blurred" : ""}`}>
          <h3 className="demon-post__title">{post.title}</h3>
          {post.content && (
            <p className="demon-post__text">{post.content}</p>
          )}
          {post.image && (
            <img
              src={getImageUrl(post.image)}
              alt={post.title}
              className="demon-post__image"
            />
          )}
        </div>
      </div>

      {/* Reactions */}
      <div className="demon-post__reactions">
        {post.reactions && Object.entries(post.reactions).map(([emoji, count]) => (
          <button
            key={emoji}
            className={`demon-post__reaction-btn ${post.userReaction === emoji ? "demon-post__reaction-btn--active" : ""
              }`}
            onClick={() => handleReaction(emoji)}
          >
            {emoji} {count > 0 ? count : ""}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="demon-post__actions">
        <button
          className="demon-post__discussion-btn"
          onClick={() => setSelectedPost(post)}
        >
          <span className="discussion-icon">💬</span>
          <span className="discussion-text">Discussion</span>
        </button>
      </div>

      {/* Demon mark decorations */}
      <div className="demon-post__mark demon-post__mark--1" aria-hidden="true" />
      <div className="demon-post__mark demon-post__mark--2" aria-hidden="true" />
    </article>
  );
};

export default DemonSlayerPostCard;
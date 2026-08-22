import { useState, useMemo } from "react";
import axios from "axios";
import "./PostCard.css";

// Helper utilities kept OUTSIDE the component so they aren't re-allocated on every render
const normalize = (str) => str?.toLowerCase().trim() || "";

const hashCode = (str) => {
  let hash = 0;
  if (!str) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const BREATHING_STYLES = ["water", "flame", "thunder", "wind", "stone"];

const DemonSlayerPostCard = ({ post, updatePost, setSelectedPost, watchlist }) => {
  const [showSpoiler, setShowSpoiler] = useState(false);

  // ✅ FIX 1: Memoize expensive watchlist calculations.
  // This loop ONLY recalculates if the specific post target or the user's watch history alters.
  const { needsBlur, isSpoiler } = useMemo(() => {
    const postAnime = normalize(post.anime);
    const isPostSpoiler = !!post.spoiler;

    if (!watchlist || watchlist.length === 0) {
      return { needsBlur: isPostSpoiler && !showSpoiler, isSpoiler: isPostSpoiler };
    }

    const hasCompletedAnime = watchlist.some(
      (item) => normalize(item.title) === postAnime && item.status === "completed"
    );

    const isInWatchlist = watchlist.some(
      (item) => normalize(item.title) === postAnime
    );

    const shouldBlur = (isPostSpoiler || isInWatchlist) && !hasCompletedAnime && !showSpoiler;

    return { needsBlur: shouldBlur, isSpoiler: isPostSpoiler };
  }, [post.anime, post.spoiler, watchlist, showSpoiler]);

  // ✅ FIX 2: Stabilize the dynamic styling calculation. 
  // No random math generation inside the paint loop.
  const breathingClass = useMemo(() => {
    const stableKey = post._id || post.title || "default";
    const styleIndex = hashCode(stableKey) % BREATHING_STYLES.length;
    return BREATHING_STYLES[styleIndex];
  }, [post._id, post.title]);

  const handleReaction = async (emoji) => {
    try {
      // Adjusted for secure credentials/JWT verification architectures
      const res = await axios.post(
        `/api/posts/${post._id}/react`, 
        { reaction: emoji },
        { withCredentials: true } 
      );
      updatePost(res.data);
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `http://localhost:5000${cleanPath}`;
  };

  return (
    <article className={`demon-post-card demon-post-card--${breathingClass}`}>
      <div className="demon-post__aura" aria-hidden="true" />

      <header className="demon-post__header">
        <div className="demon-post__breathing">
          <span className="breathing-badge">{breathingClass.toUpperCase()}</span>
          {post.user?.username && (
            <span className="demon-post__author">
              @{post.user.username}
            </span>
          )}
        </div>
        {isSpoiler && <span className="spoiler-badge">⚠️ SPOILER</span>}
      </header>

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
          {post.content && <p className="demon-post__text">{post.content}</p>}
          {post.image && (
            <img
              src={getImageUrl(post.image)}
              alt={post.title}
              className="demon-post__image"
              loading="lazy" // Frontend performance boost for long feeds
            />
          )}
        </div>
      </div>

      <div className="demon-post__reactions">
        {post.reactions &&
          Object.entries(post.reactions).map(([emoji, count]) => (
            <button
              key={emoji}
              className={`demon-post__reaction-btn ${
                post.userReaction === emoji ? "demon-post__reaction-btn--active" : ""
              }`}
              onClick={() => handleReaction(emoji)}
            >
              {emoji} {count > 0 ? count : ""}
            </button>
          ))}
      </div>

      <div className="demon-post__actions">
        <button
          className="demon-post__discussion-btn"
          onClick={() => setSelectedPost(post)}
        >
          <span className="discussion-icon">💬</span>
          <span className="discussion-text">Discussion</span>
        </button>
      </div>

      <div className="demon-post__mark demon-post__mark--1" aria-hidden="true" />
      <div className="demon-post__mark demon-post__mark--2" aria-hidden="true" />
    </article>
  );
};

export default DemonSlayerPostCard;
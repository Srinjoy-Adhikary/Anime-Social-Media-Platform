import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import PostCard from "../components/post/PostCard";
import "./Feed.css";

const BREATHING_STYLES = [
  { name: "Water Breathing", jp: "水の呼吸", color: "water", icon: "〰️" },
  { name: "Flame Breathing", jp: "炎の呼吸", color: "flame", icon: "🔥" },
  { name: "Thunder Breathing", jp: "雷の呼吸", color: "thunder", icon: "⚡" },
  { name: "Wind Breathing", jp: "風の呼吸", color: "wind", icon: "🌪️" },
  { name: "Stone Breathing", jp: "岩の呼吸", color: "stone", icon: "🪨" },
];

const DemonSlayerFeed = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [discussionId, setDiscussionId] = useState(null);
  const [collapsed, setCollapsed] = useState({});
  const [watchlist, setWatchlist] = useState([]);
  const [breathingStyle, setBreathingStyle] = useState(0);

  const scrollPosition = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setBreathingStyle((prev) => (prev + 1) % BREATHING_STYLES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const toggleCollapse = (commentId) => {
    setCollapsed((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

 const fetchPosts = useCallback(async () => {
  try {
    const userId = localStorage.getItem("userId"); // ✅ ADD THIS

    const res = await axios.get(
      `/api/posts/smartfeed/${userId}`
    );

    setPosts(res.data);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  }
}, []);

  const fetchComments = useCallback(async (postId) => {
    if (!postId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/discussions/post/${postId}`
      );
      if (res.data && res.data.length > 0) {
        setDiscussionId(res.data[0]._id);
        const repliesRes = await axios.get(
          `http://localhost:5000/api/discussions/replies/${res.data[0]._id}`
        );
        setComments(repliesRes.data);
      } else {
        setComments([]);
        setDiscussionId(null);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setComments([]);
      setDiscussionId(null);
    }
  }, []);

  useEffect(() => {
   
    console.log("FEED MOUNTED ✅");
    fetchPosts();
    const fetchWatchlist = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setWatchlist(res.data.watchlist || []);
      } catch (error) {
        console.error("Failed to fetch watchlist:", error);
      }
    };
    fetchWatchlist();
  }, [fetchPosts]);

  useEffect(() => {
    if (selectedPost) {
      fetchComments(selectedPost._id);
    } else {
      setComments([]);
      setDiscussionId(null);
    }
  }, [selectedPost, fetchComments]);

  const updatePost = (updatedPost) => {
    setPosts(posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  const handleOpenDiscussion = (post) => {
    scrollPosition.current = window.scrollY;
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseDiscussion = () => {
    setSelectedPost(null);
    setTimeout(() => {
      window.scrollTo({ top: scrollPosition.current, behavior: "instant" });
    }, 0);
  };

  const createDiscussionForPost = async (postId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/discussions/create",
        {
          postId,
          userId: localStorage.getItem("userId"),
        }
      );
      setDiscussionId(res.data.discussion._id);
      return res.data.discussion._id;
    } catch (error) {
      console.error("Failed to create discussion:", error);
      return null;
    }
  };

  const addComment = async (parentReplyId) => {
    if (!text.trim()) return;

    let currentDiscussionId = discussionId;
    if (!currentDiscussionId && selectedPost) {
      currentDiscussionId = await createDiscussionForPost(selectedPost._id);
    }
    if (!currentDiscussionId) return;

    const newComment = {
      content: text,
      userId: localStorage.getItem("userId"),
      discussionId: currentDiscussionId,
      parentReply: parentReplyId,
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/discussions/reply",
        newComment
      );
      setComments([...comments, res.data.reply]);
      setText("");
      setReplyTo(null);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/discussions/delete`, {
        data: {
          replyId: commentId,
          userId: localStorage.getItem("userId"),
        },
      });
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const buildTree = (replies) => {
    const map = {};
    const roots = [];
    if (!replies) return roots;
    replies.forEach((r) => {
      map[r._id] = { ...r, children: [] };
    });
    replies.forEach((r) => {
      if (r.parentReply && map[r.parentReply]) {
        map[r.parentReply].children.push(map[r._id]);
      } else {
        roots.push(map[r._id]);
      }
    });
    return roots;
  };

  const renderComments = (nodes, depth = 0) => {
    return nodes.map((c) => {
      const isCollapsed = collapsed[c._id];
      return (
        <div
          key={c._id}
          className="comment-wrapper"
          style={{ "--depth": depth }}
        >
          <div className="comment-container">
            <div className="comment-avatar">
              {c.userId?.username?.[0]?.toUpperCase() ?? "鬼"}
            </div>
            <div className="comment-body">
              <div
                className="comment-header"
                onClick={() => toggleCollapse(c._id)}
              >
                <span className="username">
                  @{c.userId?.username || "anon"}
                </span>
                <span className="collapse-indicator">
                  {isCollapsed ? "[+]" : "[−]"}
                </span>
              </div>
              {!isCollapsed && (
                <>
                  <div className="comment-text">{c.content}</div>
                  <div className="comment-actions">
                    <button
                      className="action-btn"
                      onClick={() => setReplyTo(c._id)}
                    >
                      ↩ REPLY
                    </button>
                    {c.userId?._id === localStorage.getItem("userId") && (
                      <button
                        className="action-btn delete-btn"
                        onClick={() => deleteComment(c._id)}
                      >
                        ✕ DELETE
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {!isCollapsed && (
            <div className="comment-children">
              {replyTo === c._id && (
                <div className="reply-input-box">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write your reply..."
                    className="reply-input"
                    onKeyDown={(e) =>
                      e.key === "Enter" && addComment(c._id)
                    }
                  />
                  <button
                    onClick={() => addComment(c._id)}
                    className="reply-submit"
                  >
                    ^
                  </button>
                </div>
              )}
              {c.children?.length > 0 &&
                renderComments(c.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const currentStyle = BREATHING_STYLES[breathingStyle];
  return (
    <div 
      className="demon-feed-container" 
      ref={containerRef}
      style={{ "--breathing-color": `var(--${currentStyle.color})` }}
    >
      {/* Blood splatter background effect */}
      <div className="blood-splatter" aria-hidden="true" />
      <div className="demon-aura" aria-hidden="true" />
      <div className="breathing-effect" aria-hidden="true" />

      <div className="demon-feed-layout">
        {/* LEFT: FEED */}
        <div className="feed-column">
          <header className="feed-header">
            <div className="breathing-indicator">
              <span className="breathing-name">{currentStyle.jp}</span>
              <span className="breathing-roman">{currentStyle.name}</span>
            </div>

            <h1 className="feed-title">
              <span className="title-kanji">OTAKU VERSE</span>
              <span className="title-main">惡鬼滅殺 </span>
              <span className="title-kanji"></span>
            </h1>

            <div className="sword-divider" />

            <div className="episode-badge">
            </div>

            <p className="feed-tagline">
              Infinity Castle
            </p>
          </header>

          <div className="posts-container">
            {selectedPost ? (
              <div className="selected-post-wrapper">
                <PostCard
                  key={selectedPost._id}
                  post={selectedPost}
                  updatePost={updatePost}
                  setSelectedPost={handleOpenDiscussion}
                  watchlist={watchlist}
                />
              </div>
            ) : (
              posts.map((post, idx) => (
                <div
                  key={post._id}
                  className="post-item"
                  style={{ "--item-index": idx }}
                >
                  <PostCard
                    post={post}
                    updatePost={updatePost}
                    setSelectedPost={handleOpenDiscussion}
                    watchlist={watchlist}
                    setWatchlist={setWatchlist} 
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: DISCUSSION */}
        <div className={`discussion-column ${selectedPost ? "active" : ""}`}>
          {selectedPost && (
            <div className="discussion-wrapper">
              <button className="back-btn" onClick={handleCloseDiscussion}>
                <span className="katana-slash">Back</span>
                <span className="back-text" to feed></span>
              </button>

              <h2 className="discussion-title">
                {selectedPost.title || "Discussion"}
              </h2>

              <div className="demon-mark-divider" />

              <div className="discussion-content">
                <div className="comments-section">
                  {comments.length > 0 ? (
                    renderComments(buildTree(comments))
                  ) : (
                    <div className="no-comments">
                      <p className="no-comments-text">
                        empty... for now.
                      </p>
                      <p className="no-comments-sub">
                        Share your thoughts and start the conversation!
                      </p>
                    </div>
                  )}
                </div>

                <div className="comment-input-section">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Share your thoughts.."
                    className="main-comment-input"
                    onKeyDown={(e) =>
                      e.key === "Enter" && addComment(null)
                    }
                  />
                  <button
                    onClick={() => addComment(null)}
                    className="submit-btn"
                  >
                    ▲ submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemonSlayerFeed;

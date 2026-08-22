import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import PostCard from "../components/post/PostCard";
import { useAuth } from "../context/AuthContext"; // Ensure this path correctly points to your AuthContext file
import "./Feed.css";

const BREATHING_STYLES = [
  { name: "Water Breathing", jp: "水の呼吸", color: "water", icon: "〰️" },
  { name: "Flame Breathing", jp: "炎の呼吸", color: "flame", icon: "🔥" },
  { name: "Thunder Breathing", jp: "雷の呼吸", color: "thunder", icon: "⚡" },
  { name: "Wind Breathing", jp: "風の呼吸", color: "wind", icon: "🌪️" },
  { name: "Stone Breathing", jp: "岩の呼吸", color: "stone", icon: "🪨" },
];

// Sub-component to isolate inline reply states and prevent global text bleeding
const ReplyInput = ({ onCommentAdd, parentReplyId }) => {
  const [replyText, setReplyText] = useState("");

  const handleSubmit = () => {
    if (!replyText.trim()) return;
    onCommentAdd(replyText, parentReplyId);
    setReplyText("");
  };

  return (
    <div className="reply-input-box">
      <input
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Write your reply..."
        className="reply-input"
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <button onClick={handleSubmit} className="reply-submit">
        ▲
      </button>
    </div>
  );
};

const DemonSlayerFeed = () => {
  const { user } = useAuth(); // ── EXTRACT LIVE REACTIVE USER CONTEXT ──
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [mainCommentText, setMainCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [discussionId, setDiscussionId] = useState(null);
  const [collapsed, setCollapsed] = useState({});
  const [watchlist, setWatchlist] = useState([]);
  const [breathingStyle, setBreathingStyle] = useState(0);

  const scrollPosition = useRef(0);
  const containerRef = useRef(null);

  // Interval rotation for breathing aesthetic
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathingStyle((prev) => (prev + 1) % BREATHING_STYLES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const toggleCollapse = useCallback((commentId) => {
    setCollapsed((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  }, []);

  const fetchPosts = useCallback(async () => {
    const currentUserId = user?.id ;
    if (!currentUserId) return;
    try {
      const res = await axios.get(`/api/posts/smartfeed/${currentUserId}`);
      setPosts(res.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  }, [user?.id]); // Depend on user.id to refetch posts when account changes

  const fetchComments = useCallback(async (postId) => {
    if (!postId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/discussions/post/${postId}`);
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

  // Sync effect for initial app mounting and cross-account logins
  useEffect(() => {
    fetchPosts();
    const fetchWatchlist = async () => {
      const currentUserId = user?.id || localStorage.getItem("userId");
      if (!currentUserId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${currentUserId}`);
        setWatchlist(res.data.watchlist || []);
      } catch (error) {
        console.error("Failed to fetch watchlist:", error);
      }
    };
    fetchWatchlist();
  }, [fetchPosts, user?.id]); // Triggers cleanly when context updates

  // Sync effect when a unique discussion post layout is targeted
  useEffect(() => {
    if (selectedPost) {
      fetchComments(selectedPost._id);
    } else {
      setComments([]);
      setDiscussionId(null);
    }
  }, [selectedPost, fetchComments]);

  const updatePost = useCallback((updatedPost) => {
    setPosts((prevPosts) => prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  }, []);

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
    const currentUserId = user?.id || localStorage.getItem("userId");
    try {
      const res = await axios.post("http://localhost:5000/api/discussions/create", {
        postId,
        userId: currentUserId,
      });
      setDiscussionId(res.data.discussion._id);
      return res.data.discussion._id;
    } catch (error) {
      console.error("Failed to create discussion:", error);
      return null;
    }
  };

  const addComment = async (textToSubmit, parentReplyId = null) => {
    let currentDiscussionId = discussionId;
    if (!currentDiscussionId && selectedPost) {
      currentDiscussionId = await createDiscussionForPost(selectedPost._id);
    }
    if (!currentDiscussionId) return;

    const currentUserId = user?.id || localStorage.getItem("userId");
    const newComment = {
      content: textToSubmit,
      userId: currentUserId,
      discussionId: currentDiscussionId,
      parentReply: parentReplyId,
    };

    try {
      const res = await axios.post("http://localhost:5000/api/discussions/reply", newComment);
      setComments((prevComments) => [...prevComments, res.data.reply]);
      setReplyTo(null);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const deleteComment = async (commentId) => {
    const currentUserId = user?.id || localStorage.getItem("userId");
    try {
      await axios.delete(`http://localhost:5000/api/discussions/delete`, {
        data: {
          replyId: commentId,
          userId: currentUserId,
        },
      });
      setComments((prevComments) => prevComments.filter((c) => c._id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  // Memoizing the tree structure computation so it only fires when comment data modifies
  const commentTree = useMemo(() => {
    const map = {};
    const roots = [];
    if (!comments) return roots;

    comments.forEach((r) => {
      map[r._id] = { ...r, children: [] };
    });

    comments.forEach((r) => {
      if (r.parentReply && map[r.parentReply]) {
        map[r.parentReply].children.push(map[r._id]);
      } else {
        roots.push(map[r._id]);
      }
    });
    return roots;
  }, [comments]);

  const renderComments = (nodes, depth = 0) => {
    return nodes.map((c) => {
      const isCollapsed = collapsed[c._id];
      return (
        <div key={c._id} className="comment-wrapper" style={{ "--depth": depth }}>
          <div className="comment-container">
            <div className="comment-avatar">
              {c.userId?.username?.[0]?.toUpperCase() ?? "鬼"}
            </div>
            <div className="comment-body">
              <div className="comment-header" onClick={() => toggleCollapse(c._id)}>
                <span className="username">@{c.userId?.username || "anon"}</span>
                <span className="collapse-indicator">{isCollapsed ? "[+]" : "[−]"}</span>
              </div>
              {!isCollapsed && (
                <>
                  <div className="comment-text">{c.content}</div>
                  <div className="comment-actions">
                    <button className="action-btn" onClick={() => setReplyTo(c._id)}>
                      ↩ REPLY
                    </button>
                    {/* ── UPDATED LOGIC TO MATCH INTERFACE WITH THE LIVE LOGGED-IN CONTEXT USER ── */}
                    {c.userId?._id === user?.id && (
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
                <ReplyInput onCommentAdd={addComment} parentReplyId={c._id} />
              )}
              {c.children?.length > 0 && renderComments(c.children, depth + 1)}
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
      <div className="blood-splatter" aria-hidden="true" />
      <div className="demon-aura" aria-hidden="true" />
      <div className="breathing-effect" aria-hidden="true" />

      <div className="demon-feed-layout">
        {/* LEFT FEED PANEL */}
        <div className="feed-column">
          <header className="feed-header">
            <div className="breathing-indicator">
              <span className="breathing-name">{currentStyle.jp}</span>
              <span className="breathing-roman">{currentStyle.name}</span>
            </div>
            <h1 className="feed-title">
              <span className="title-kanji">OTAKU VERSE</span>
              <span className="title-main">惡鬼滅殺 </span>
            </h1>
            <div className="sword-divider" />
            <p className="feed-tagline">Infinity Castle</p>
          </header>

          <div className="posts-container">
            {selectedPost ? (
              <div className="selected-post-wrapper">
                <PostCard
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

        {/* RIGHT DISCUSSION WORKSPACE */}
        <div className={`discussion-column ${selectedPost ? "active" : ""}`}>
          {selectedPost && (
            <div className="discussion-wrapper">
              <button className="back-btn" onClick={handleCloseDiscussion}>
                <span className="katana-slash">Back</span>
              </button>

              <h2 className="discussion-title">{selectedPost.title || "Discussion"}</h2>
              <div className="demon-mark-divider" />

              <div className="discussion-content">
                <div className="comments-section">
                  {comments.length > 0 ? (
                    renderComments(commentTree)
                  ) : (
                    <div className="no-comments">
                      <p className="no-comments-text">empty... for now.</p>
                      <p className="no-comments-sub">
                        Share your thoughts and start the conversation!
                      </p>
                    </div>
                  )}
                </div>

                <div className="comment-input-section">
                  <input
                    value={mainCommentText}
                    onChange={(e) => setMainCommentText(e.target.value)}
                    placeholder="Share your thoughts.."
                    className="main-comment-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && mainCommentText.trim()) {
                        addComment(mainCommentText, null);
                        setMainCommentText("");
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (mainCommentText.trim()) {
                        addComment(mainCommentText, null);
                        setMainCommentText("");
                      }
                    }}
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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    anime: "",
    spoiler: false,
    image: null,
  });

  const [animeResults, setAnimeResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle text and checkbox inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle image upload
  const handleImage = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  // 🔍 Anime Search (Backend Proxy)
  const searchAnime = async (query) => {
    if (!query.trim()) {
      setAnimeResults([]);
      return;
    }

    try {
      const res = await API.get(`/api/anime/search?q=${encodeURIComponent(query)}`);
      setAnimeResults(res.data || []);
    } catch (err) {
      console.error("Failed to fetch anime suggestions:", err);
    }
  };

  // Select anime
  const selectAnime = (title) => {
    setFormData((prev) => ({ ...prev, anime: title }));
    setAnimeResults([]);
  };

  // 🚀 Submit Post
  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentUserId = user?.id || localStorage.getItem("userId");

    if (!currentUserId) {
      alert("You must be logged in to post!");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("anime", formData.anime);
      data.append("spoiler", formData.spoiler);
      data.append("userId", currentUserId);

      if (formData.image) {
        data.append("image", formData.image);
      }

      await API.post("/api/posts", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/feed");
    } catch (err) {
      console.error("Error creating post:", err);
      alert(err.response?.data?.message || "Error creating post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.jjkDomain}>
      {/* Three-Way Sendai Deadlock Panels */}
      <div style={{ ...styles.mangaPanel, ...styles.sendaiPanel1 }}></div>
      <div style={{ ...styles.mangaPanel, ...styles.sendaiPanel2 }}></div>
      <div style={{ ...styles.mangaPanel, ...styles.sendaiPanel3 }}></div>

      {/* Left Flank Details */}
      <div style={styles.leftFlank}>
        <div style={styles.giantKanjiBlue}>領域展開</div>
        <div style={styles.subKanji}>仙台結界</div>
      </div>

      {/* Right Flank Details */}
      <div style={styles.rightFlank}>
        <div style={styles.giantKanjiRed}>特級</div>
        <div style={styles.subKanji}>完全顕現</div>
      </div>

      {/* Spatial Distortions */}
      <div style={styles.spatialDistortion1}></div>
      <div style={styles.spatialDistortion2}></div>

      <div style={styles.sorcererCard}>
        <div style={styles.headerContainer}>
          <div style={styles.gojoEyeLeft}></div>
          <h2 style={styles.jjkHeader}>Otaku Verse</h2>
          <div style={styles.gojoEyeRight}></div>
        </div>
        <p style={styles.subHeader}>Anomalies are everywhere</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Cursed Title Input */}
          <div style={styles.inputWrapper}>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              style={styles.jjkInput}
              required
            />
          </div>

          {/* Cursed Content Textarea */}
          <div style={styles.inputWrapper}>
            <textarea
              name="content"
              placeholder="Content"
              value={formData.content}
              onChange={handleChange}
              style={styles.jjkTextarea}
              required
            />
          </div>

          {/* Six Eyes Search */}
          <div style={styles.inputWrapper}>
            <input
              type="text"
              placeholder="Search database (Anime)..."
              onChange={(e) => searchAnime(e.target.value)}
              style={styles.jjkSearchInput}
            />

            {/* Dropdown */}
            {animeResults.length > 0 && (
              <div style={styles.jjkDropdown}>
                {animeResults.map((anime) => (
                  <div
                    key={anime.mal_id || anime._id || anime.title}
                    style={styles.jjkDropdownItem}
                    onClick={() => selectAnime(anime.title)}
                  >
                    {anime.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tag Pill */}
          {formData.anime && (
            <div style={styles.blackFlashPillContainer}>
              <span style={styles.blackFlashPill}>TAG: {formData.anime}</span>
            </div>
          )}

          {/* Action Row */}
          <div style={styles.actionRow}>
            <label style={styles.cursedToolUpload}>
              <span style={styles.uploadIcon}></span> UPLOAD IMAGE
              <input
                type="file"
                onChange={handleImage}
                accept="image/*"
                style={{ display: "none" }}
              />
            </label>

            <label style={styles.spoilerCheckboxLabel}>
              <input
                type="checkbox"
                name="spoiler"
                checked={formData.spoiler}
                onChange={handleChange}
                style={styles.jjkCheckbox}
              />
              <span style={styles.spoilerWarning}>CLASSIFIED</span>
            </label>
          </div>

          {/* Image Preview */}
          {formData.image && (
            <div style={styles.blackFlashPreviewContainer}>
              <img
                src={URL.createObjectURL(formData.image)}
                alt="preview"
                style={styles.jjkPreviewImage}
              />
            </div>
          )}

          {/* Black Flash Submit Button */}
          <button type="submit" style={styles.blackFlashButton} disabled={loading}>
            {loading ? "MANIFESTING..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  leftFlank: {
    position: "absolute",
    left: "3%",
    top: "0",
    bottom: "0",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
    pointerEvents: "none",
  },
  rightFlank: {
    position: "absolute",
    right: "3%",
    top: "0",
    bottom: "0",
    display: "flex",
    flexDirection: "row-reverse",
    alignItems: "center",
    zIndex: 1,
    pointerEvents: "none",
  },
  giantKanjiBlue: {
    writingMode: "vertical-rl",
    textOrientation: "upright",
    fontSize: "8rem",
    fontWeight: "900",
    color: "rgba(0, 242, 255, 0.05)",
    textShadow: "0 0 20px rgba(0, 242, 255, 0.2)",
    letterSpacing: "20px",
    userSelect: "none",
  },
  giantKanjiRed: {
    writingMode: "vertical-rl",
    textOrientation: "upright",
    fontSize: "8rem",
    fontWeight: "900",
    color: "rgba(230, 0, 0, 0.05)",
    textShadow: "0 0 20px rgba(230, 0, 0, 0.2)",
    letterSpacing: "20px",
    userSelect: "none",
  },
  subKanji: {
    writingMode: "vertical-rl",
    textOrientation: "upright",
    fontSize: "3rem",
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.1)",
    letterSpacing: "15px",
    marginLeft: "20px",
    marginRight: "20px",
    userSelect: "none",
  },
  jjkDomain: {
    background: "radial-gradient(circle at center, #101018 0%, #000000 100%)",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Exo 2', sans-serif",
  },
  spatialDistortion1: {
    position: "absolute",
    width: "300px",
    height: "300px",
    border: "1px solid rgba(0, 242, 255, 0.05)",
    transform: "rotate(45deg)",
    top: "-50px",
    left: "-50px",
  },
  spatialDistortion2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    border: "1px solid rgba(0, 242, 255, 0.03)",
    transform: "rotate(15deg)",
    bottom: "-100px",
    right: "-50px",
  },
  sorcererCard: {
    background: "#05050a",
    padding: "35px",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "480px",
    color: "#cbd5e1",
    boxShadow: "0 0 40px rgba(0, 0, 0, 0.9), 0 0 15px rgba(0, 242, 255, 0.15)",
    border: "2px solid #111",
    position: "relative",
    zIndex: 1,
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "8px",
  },
  gojoEyeLeft: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#00f2ff",
    boxShadow: "0 0 10px #00f2ff",
  },
  gojoEyeRight: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#00f2ff",
    boxShadow: "0 0 10px #00f2ff",
  },
  jjkHeader: {
    margin: "0",
    fontSize: "2rem",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "3px",
    color: "#ffffff",
    textShadow: "0 0 10px rgba(0, 242, 255, 0.7)",
  },
  subHeader: {
    textAlign: "center",
    marginTop: "0",
    marginBottom: "25px",
    color: "#777",
    fontSize: "0.9rem",
    fontStyle: "italic",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputWrapper: {
    position: "relative",
  },
  jjkInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "16px",
    borderRadius: "4px",
    border: "1px solid rgba(0, 242, 255, 0.2)",
    background: "rgba(0, 0, 0, 0.5)",
    color: "#ffffff",
    fontSize: "1rem",
    outline: "none",
  },
  jjkTextarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "16px",
    borderRadius: "4px",
    border: "1px solid rgba(0, 242, 255, 0.2)",
    background: "rgba(0, 0, 0, 0.5)",
    color: "#ffffff",
    fontSize: "1rem",
    minHeight: "130px",
    resize: "vertical",
    outline: "none",
  },
  jjkSearchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "16px",
    borderRadius: "4px",
    border: "1px solid rgba(0, 242, 255, 0.4)",
    background: "rgba(0, 242, 255, 0.03)",
    color: "#ffffff",
    fontSize: "1rem",
    outline: "none",
  },
  jjkDropdown: {
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    background: "#080810",
    borderRadius: "4px",
    marginTop: "5px",
    maxHeight: "160px",
    overflowY: "auto",
    zIndex: 10,
    border: "1px solid #222",
  },
  jjkDropdownItem: {
    padding: "14px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #1a1a25",
    fontSize: "0.9rem",
  },
  blackFlashPillContainer: {
    display: "flex",
    alignItems: "center",
  },
  blackFlashPill: {
    background: "linear-gradient(90deg, #000000 0%, #330000 100%)",
    color: "#ffffff",
    padding: "8px 16px",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: "700",
    letterSpacing: "1px",
    border: "1px solid #e60000",
    textShadow: "0 0 5px #e60000",
    textTransform: "uppercase",
  },
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
  },
  cursedToolUpload: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 20px",
    background: "#11111a",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#00f2ff",
    border: "1px solid #222",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  uploadIcon: {
    fontSize: "1.2rem",
    color: "#777",
  },
  spoilerCheckboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
  },
  jjkCheckbox: {
    accentColor: "#e60000",
    cursor: "pointer",
    width: "18px",
    height: "18px",
  },
  spoilerWarning: {
    color: "#e60000",
    fontWeight: "700",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
    textShadow: "0 0 3px rgba(230, 0, 0, 0.4)",
  },
  blackFlashPreviewContainer: {
    width: "100%",
    borderRadius: "4px",
    overflow: "hidden",
    marginTop: "10px",
    position: "relative",
    border: "2px solid #e60000",
    boxShadow: "0 0 15px #e60000",
  },
  jjkPreviewImage: {
    width: "100%",
    display: "block",
    objectFit: "cover",
    maxHeight: "320px",
    filter: "contrast(1.1) brightness(0.9)",
  },
  blackFlashButton: {
    padding: "16px",
    border: "none",
    borderRadius: "4px",
    background:
      "linear-gradient(45deg, #000000 0%, #e60000 45%, #ffffff 50%, #e60000 55%, #000000 100%)",
    backgroundSize: "200% auto",
    color: "#000000",
    fontSize: "1.1rem",
    fontWeight: "900",
    cursor: "pointer",
    marginTop: "20px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    boxShadow: "0 0 20px rgba(230, 0, 0, 0.6)",
  },
};

export default CreatePost;
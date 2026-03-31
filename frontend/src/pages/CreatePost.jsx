import { useState } from "react";
import axios from "axios";

function CreatePost() {

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    anime: "",
    spoiler: false,
    image: null
  });

  const [animeResults, setAnimeResults] = useState([]);

  // Handle text input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Handle image upload
  const handleImage = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0]
    });
  };

  // 🔍 Anime Search (Jikan via your backend)
  const searchAnime = async (query) => {
    if (!query) return;

    try {
      const res = await axios.get(
        `/query}`
      );
      setAnimeResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Select anime
  const selectAnime = (title) => {
    setFormData({ ...formData, anime: title });
    setAnimeResults([]);
  };

  // 🚀 Submit Post
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Get the current user's ID (assuming you stored it during login)
    const userId = localStorage.getItem("userId"); 

    if (!userId) {
      alert("You must be logged in to post!");
      return;
    }

    try {
      const data = new FormData();

      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("anime", formData.anime);
      data.append("spoiler", formData.spoiler);
      data.append("image", formData.image);
      
      // 2. Append the userId so the backend knows who is posting
      data.append("userId", userId); 

      await axios.post(
        "/api/posts",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("Post created!");
      window.location.href = "/feed";

    } catch (err) {
      console.error(err);
      alert("Error creating post");
    }
  };


// NOTE: I am assuming 'theme', 'handleChange', 'handleSubmit', 'formData', etc., 
// are passed as props or exist in your state management above this block,
// as they were referenced in your previous code.



  // --- Theme constants based on JJK ---
  const jjkTheme = {
    domainBg: "#010105",               // Almost pure black depth
    cursedBlue: "#00f2ff",             // Gojo's Six Eyes electric cyan
    cursedBlueVoid: "rgba(0, 242, 255, 0.1)", // Faint spatial energy
    blackFlashCrimson: "#e60000",      // Aggressive red spark
    blackFlashCore: "#000000",         // Pure black distortion
    sorcererText: "#cbd5e1",            // Cold white/grey
    activeText: "#ffffff",
  };

  return (<div style={styles.jjkDomain}>
      
      {/* --- THREE-WAY SENDAI DEADLOCK PANELS --- */}
      <div style={{...styles.mangaPanel, ...styles.sendaiPanel1}}></div>
      <div style={{...styles.mangaPanel, ...styles.sendaiPanel2}}></div>
      <div style={{...styles.mangaPanel, ...styles.sendaiPanel3}}></div>

      {/* 👇 NEW: LEFT FLANK DETAILS 👇 */}
      <div style={styles.leftFlank}>
        <div style={styles.giantKanjiBlue}>領域展開</div> {/* "Domain Expansion" */}
        <div style={styles.subKanji}>仙台結界</div> {/* "Sendai Colony" */}
      </div>

      {/* 👇 NEW: RIGHT FLANK DETAILS 👇 */}
      <div style={styles.rightFlank}>
        <div style={styles.giantKanjiRed}>特級</div> {/* "Special Grade" */}
        <div style={styles.subKanji}>完全顕現</div> {/* "Complete Manifestation" */}
      </div>
      {/* Decorative Spatial Distortions (Simulating Domain Expansion) */}
      <div style={styles.spatialDistortion1}></div>
      <div style={styles.spatialDistortion2}></div>

      <div style={styles.sorcererCard}>
        {/* Gojo's Eyes Header - Subtle Glow */}
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

          {/* Six Eyes Search (Anime Tagging) */}
          <div style={styles.inputWrapper}>
            <input
              type="text"
              placeholder=" Search  database (Anime)..."
              onChange={(e) => searchAnime(e.target.value)}
              style={styles.jjkSearchInput}
            />
            
            {/* Cursed Dropdown */}
            {animeResults.length > 0 && (
              <div style={styles.jjkDropdown}>
                {animeResults.map((anime) => (
                  <div
                    key={anime.mal_id}
                    style={styles.jjkDropdownItem}
                    onClick={() => selectAnime(anime.title)}
                  >
                    {anime.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Black Flash Pill (Selected Anime) */}
          {formData.anime && (
            <div style={styles.blackFlashPillContainer}>
              <span style={styles.blackFlashPill}>
                TAG: {formData.anime}
              </span>
            </div>
          )}

          {/* Lower Action Row (Upload & Spoiler) */}
          <div style={styles.actionRow}>
            {/* Custom Upload Button - Looks like Cursed Tool */}
            <label style={styles.cursedToolUpload}>
              <span style={styles.uploadIcon}></span> UPLOAD IMAGE              <input 
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
              <span style={styles.spoilerWarning}> CLASSIFIED</span>
            </label>
          </div>

          {/* Image Preview - Black Flash Border Distortion */}
          {formData.image && (
            <div style={styles.blackFlashPreviewContainer}>
              <img
                src={URL.createObjectURL(formData.image)}
                alt="preview"
                style={styles.jjkPreviewImage}
              />
            </div>
          )}

          {/* BLACK FLASH BUTTON (Submit) */}
          <button type="submit" style={styles.blackFlashButton}>
            Submit
          </button>

        </form>
      </div>
    </div>
  );
}

// --- JJK INSPIRED STYLES ---
const styles = {// --- NEW FLANK DECORATIONS ---
  leftFlank: {
    position: "absolute",
    left: "3%",
    top: "0",
    bottom: "0",
    display: "flex",
    flexDirection: "row", // Aligns the text columns next to each other
    alignItems: "center",
    zIndex: 1, // Sits above the manga panels but behind the form
    pointerEvents: "none", // Makes sure you can't accidentally click it
  },
  rightFlank: {
    position: "absolute",
    right: "3%",
    top: "0",
    bottom: "0",
    display: "flex",
    flexDirection: "row-reverse", // Mirrors the left side
    alignItems: "center",
    zIndex: 1,
    pointerEvents: "none",
  },
  
  // The massive, glowing Kanji watermarks
  giantKanjiBlue: {
    writingMode: "vertical-rl", // Stacks the text vertically!
    textOrientation: "upright",
    fontSize: "8rem", // Massive text
    fontWeight: "900",
    color: "rgba(0, 242, 255, 0.05)", // Very faint
    textShadow: "0 0 20px rgba(0, 242, 255, 0.2)", // Glowing Gojo Blue
    letterSpacing: "20px",
    userSelect: "none",
  },
  giantKanjiRed: {
    writingMode: "vertical-rl",
    textOrientation: "upright",
    fontSize: "8rem",
    fontWeight: "900",
    color: "rgba(230, 0, 0, 0.05)", // Very faint Crimson
    textShadow: "0 0 20px rgba(230, 0, 0, 0.2)", // Glowing Black Flash Red
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
  
  // Culling Game "Barrier" warning tapes running down the edges
  cullingGameWarning: {
    writingMode: "vertical-rl",
    transform: "rotate(180deg)", // Makes it read top-to-bottom
    fontSize: "1rem",
    fontWeight: "800",
    color: "#000",
    background: "#ffcc00", // Bright yellow warning tape
    padding: "20px 5px",
    letterSpacing: "5px",
    borderLeft: "2px solid #000",
    borderRight: "2px solid #000",
    boxShadow: "0 0 15px rgba(255, 204, 0, 0.3)",
  },
  cullingGameWarningRight: {
    writingMode: "vertical-rl",
    fontSize: "1rem",
    fontWeight: "800",
    color: "#000",
    background: "#ffcc00",
    padding: "20px 5px",
    letterSpacing: "5px",
    borderLeft: "2px solid #000",
    borderRight: "2px solid #000",
    boxShadow: "0 0 15px rgba(255, 204, 0, 0.3)",
  },
  // Domain Expansion Background Structure
  jjkDomain: {
    background: "radial-gradient(circle at center, #101018 0%, #000000 100%)",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Exo 2', sans-serif" // Recommend adding a sleek font like Exo 2 or Orbitron to your index.html
  },
  // Decorative geometric distortions for Domain expansion feel
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
  // Main Sorcerer Form Card
  sorcererCard: {
    background: "#05050a", // Aggressive deep black
    padding: "35px",
    borderRadius: "8px", // Sharper corners for aggressive feel
    width: "100%",
    maxWidth: "480px",
    color: "#cbd5e1",
    boxShadow: "0 0 40px rgba(0, 0, 0, 0.9), 0 0 15px rgba(0, 242, 255, 0.15)", // Deep dark shadow + Six eyes blue glow
    border: "2px solid #111", // Stark border
    position: "relative",
    zIndex: 1,
  },
  // Header Section with "Eyes" motif
  headerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "8px"
  },
  gojoEyeLeft: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#00f2ff",
    boxShadow: "0 0 10px #00f2ff", // Glowing pupil
  },
  gojoEyeRight: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#00f2ff",
    boxShadow: "0 0 10px #00f2ff", // Glowing pupil
  },
  jjkHeader: {
    margin: "0",
    fontSize: "2rem",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "3px",
    color: "#ffffff",
    textShadow: "0 0 10px rgba(0, 242, 255, 0.7)" // Glowing header text
  },
  subHeader: {
    textAlign: "center",
    marginTop: "0",
    marginBottom: "25px",
    color: "#777",
    fontSize: "0.9rem",
    fontStyle: "italic"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },
  inputWrapper: {
    position: "relative"
  },
  // Core Six Eyes Input Style (cyan borders + subtle glow)
  jjkInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "16px",
    borderRadius: "4px",
    border: "1px solid rgba(0, 242, 255, 0.2)", // Subtle Blue
    background: "rgba(0, 0, 0, 0.5)", // Dark depth
    color: "#ffffff",
    fontSize: "1rem",
    outline: "none",
    transition: "box-shadow 0.2s, border 0.2s",
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
    border: "1px solid rgba(0, 242, 255, 0.4)", // Stronger blue border for active search
    background: "rgba(0, 242, 255, 0.03)", // Very faint blue tint
    color: "#ffffff",
    fontSize: "1rem",
    outline: "none",
  },
  // Cursed Object Dropdown
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
    border: "1px solid #222"
  },
  jjkDropdownItem: {
    padding: "14px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #1a1a25",
    transition: "background 0.2s, color 0.2s",
    fontSize: "0.9rem"
  },
  // BLACK FLASH PILL (Selected Anime)
  blackFlashPillContainer: {
    display: "flex",
    alignItems: "center"
  },
  blackFlashPill: {
    background: "linear-gradient(90deg, #000000 0%, #330000 100%)", // Black Flash core
    color: "#ffffff",
    padding: "8px 16px",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: "700",
    letterSpacing: "1px",
    border: "1px solid #e60000", // Crimson outline distortion
    textShadow: "0 0 5px #e60000",
    textTransform: "uppercase"
  },
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px"
  },
  // Styled File Upload like Cursed Tool
  cursedToolUpload: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 20px",
    background: "#11111a", // Deep grey/blue
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#00f2ff", // Cursed Tool cyan text
    border: "1px solid #222",
    textTransform: "uppercase",
    letterSpacing: "1px",
    transition: "background 0.2s",
  },
  uploadIcon: {
    fontSize: "1.2rem",
    color: "#777"
  },
  // Classified/Spoiler Styling
  spoilerCheckboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
  },
  jjkCheckbox: {
    accentColor: "#e60000", // Crimson red check
    cursor: "pointer",
    width: "18px",
    height: "18px"
  },
  spoilerWarning: {
    color: "#e60000", // Crimson red text
    fontWeight: "700",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
    textShadow: "0 0 3px rgba(230, 0, 0, 0.4)"
  },
  // Image Preview with Distortion Border
  blackFlashPreviewContainer: {
    width: "100%",
    borderRadius: "4px",
    overflow: "hidden",
    marginTop: "10px",
    position: "relative",
    border: "2px solid #e60000", // Crimson Black flash distortion outline
    boxShadow: "0 0 15px #e60000"
  },
  jjkPreviewImage: {
    width: "100%",
    display: "block",
    objectFit: "cover",
    maxHeight: "320px",
    filter: "contrast(1.1) brightness(0.9)" // Slightly grittier look
  },
  // THE BLACK FLASH BUTTON (Submit)
  blackFlashButton: {
    padding: "16px",
    border: "none",
    borderRadius: "4px",
    // Aggressive Black Flash spatial distortion gradient (crimson to pure black)
    background: "linear-gradient(45deg, #000000 0%, #e60000 45%, #ffffff 50%, #e60000 55%, #000000 100%)",
    backgroundSize: "200% auto", // Crucial for movement if animated
    color: "#000000", // High contrast black text on white spark core
    fontSize: "1.1rem",
    fontWeight: "900",
    cursor: "pointer",
    marginTop: "20px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    boxShadow: "0 0 20px rgba(230, 0, 0, 0.6)", // Red chaotic glow
    transition: "transform 0.1s ease, box-shadow 0.2s ease",
  }
};

export default CreatePost;
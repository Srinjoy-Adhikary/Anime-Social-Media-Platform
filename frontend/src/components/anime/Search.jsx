import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- BERSERK DARK FANTASY THEME ---
const theme = {
  colors: {
    background: '#0a0a0f',
    surface: 'rgba(30, 20, 20, 0.6)',
    text: '#e8e8e8',
    subtext: '#9ca3af',
    accent: '#dc2626', // Blood red
    accentGlow: '#ef4444',
    steel: '#71717a',
    eclipse: '#1e1b4b',
    border: 'rgba(220, 38, 38, 0.15)',
  },
  shadows: {
    card: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 60px rgba(220, 38, 38, 0.1)',
    glow: '0 0 20px rgba(220, 38, 38, 0.4), 0 0 40px rgba(220, 38, 38, 0.2)',
    eclipse: '0 0 100px rgba(30, 27, 75, 0.5)',
  }
};

const styles = {
  '@keyframes fadeInUp': {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  },
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.7 }
  },
  '@keyframes rotate': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' }
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' }
  },

  container: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: theme.colors.text,
    background: `linear-gradient(180deg, ${theme.colors.background} 0%, #0f0a15 50%, #150a15 100%)`,
    minHeight: "100vh",
    padding: "60px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: 'relative',
    overflow: 'hidden'
  },

  // BACKGROUND EFFECTS
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(220, 38, 38, 0.1) 10px, rgba(220, 38, 38, 0.1) 20px)`,
    pointerEvents: 'none',
    zIndex: 0
  },

  eclipseGlow: {
    position: 'absolute',
    top: '-200px',
    right: '-200px',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(220, 38, 38, 0.2) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    pointerEvents: 'none',
    zIndex: 0
  },

  // HEADER WITH BRAND OF SACRIFICE
  header: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    marginBottom: '50px',
    animation: 'fadeInUp 0.8s ease-out'
  },

  title: {
    fontFamily: "'Cinzel', 'Playfair Display', serif",
    fontSize: '3.5rem',
    fontWeight: '900',
    background: `linear-gradient(135deg, #ffffff 0%, ${theme.colors.accent} 50%, ${theme.colors.steel} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '3px',
    textShadow: '0 0 30px rgba(220, 38, 38, 0.5)',
    marginBottom: '12px',
    position: 'relative'
  },

  subtitle: {
    fontSize: '1rem',
    color: theme.colors.subtext,
    letterSpacing: '4px',
    textTransform: 'uppercase',
    fontWeight: '300'
  },

  brandOfSacrifice: {
    position: 'absolute',
    top: '-40px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '3rem',
    color: theme.colors.accent,
    opacity: 0.15,
    animation: 'pulse 3s ease-in-out infinite'
  },

  // SEARCH BAR
  searchWrapper: {
    position: 'relative',
    zIndex: 1,
    width: "100%",
    maxWidth: "900px",
    display: "flex",
    gap: "16px",
    marginBottom: "60px",
    animation: 'fadeInUp 1s ease-out 0.2s backwards'
  },

  input: {
    flex: 1,
    padding: "20px 32px",
    borderRadius: "16px",
    border: `2px solid ${theme.colors.border}`,
    backgroundColor: 'rgba(20, 20, 25, 0.8)',
    backdropFilter: 'blur(20px)',
    color: theme.colors.text,
    fontSize: '1.1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)',
    '::placeholder': {
      color: theme.colors.subtext
    }
  },

  searchBtn: {
    padding: "0 48px",
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #991b1b 100%)`,
    border: `2px solid ${theme.colors.accent}`,
    color: "#fff",
    borderRadius: "16px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: '1.1rem',
    letterSpacing: '1px',
    boxShadow: theme.shadows.glow,
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    position: 'relative',
    overflow: 'hidden'
  },

  // LOADING STATE
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '60px',
    position: 'relative',
    zIndex: 1
  },

  loadingSpinner: {
    width: '60px',
    height: '60px',
    border: `4px solid ${theme.colors.border}`,
    borderTop: `4px solid ${theme.colors.accent}`,
    borderRadius: '50%',
    animation: 'rotate 1s linear infinite'
  },

  loadingText: {
    fontSize: '1.2rem',
    color: theme.colors.subtext,
    letterSpacing: '2px',
    animation: 'pulse 2s ease-in-out infinite'
  },

  // GRID & CARDS
  grid: {
    position: 'relative',
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "32px",
    width: "100%",
    maxWidth: "1400px"
  },

  animeCard: {
    background: theme.colors.surface,
    borderRadius: "20px",
    border: `2px solid ${theme.colors.border}`,
    overflow: "hidden",
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative',
    backdropFilter: 'blur(10px)',
    animation: 'fadeInUp 0.6s ease-out backwards',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
  },

  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '360px',
    overflow: 'hidden',
    backgroundColor: '#000'
  },

  animeImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: 'transform 0.5s ease, filter 0.3s ease',
    filter: 'brightness(0.9) contrast(1.1)'
  },

  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },

  scoreBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)',
    padding: '8px 16px',
    borderRadius: '12px',
    border: `1px solid ${theme.colors.accent}`,
    color: theme.colors.accentGlow,
    fontWeight: '700',
    fontSize: '1rem',
    boxShadow: theme.shadows.glow,
    zIndex: 2
  },

  animeInfo: {
    padding: "24px",
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    background: 'linear-gradient(180deg, rgba(15, 10, 15, 0.9) 0%, rgba(10, 10, 15, 0.95) 100%)'
  },

  animeTitle: {
    margin: '0 0 12px 0',
    fontSize: '1.2rem',
    color: '#fff',
    lineHeight: '1.4',
    fontWeight: '700',
    letterSpacing: '0.5px',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
  },

  animeMetadata: {
    margin: '0 0 20px 0',
    fontSize: '0.85rem',
    color: theme.colors.subtext,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  metadataRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  separator: {
    color: theme.colors.accent,
    opacity: 0.5
  },

  // STATUS DROPDOWN & ADD BUTTON
  actionsWrapper: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  select: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: `2px solid ${theme.colors.border}`,
    backgroundColor: 'rgba(20, 20, 25, 0.8)',
    color: theme.colors.text,
    outline: "none",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: '500',
    transition: 'all 0.3s ease',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23dc2626' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '40px',
    appearance: 'none'
  },

  addBtn: {
    width: "100%",
    padding: "14px",
    background: `linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(153, 27, 27, 0.15) 100%)`,
    border: `2px solid ${theme.colors.border}`,
    color: theme.colors.accent,
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: '0.95rem',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    transition: "all 0.3s ease",
    position: 'relative',
    overflow: 'hidden'
  },

  // GENRES
  genresContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '12px'
  },

  genreTag: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: 'rgba(220, 38, 38, 0.1)',
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.accent,
    letterSpacing: '0.5px'
  },

  // EMPTY STATE
  emptyState: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: '80px 20px',
    color: theme.colors.subtext
  },

  emptyStateIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
    opacity: 0.3
  },

  emptyStateText: {
    fontSize: '1.2rem',
    letterSpacing: '1px'
  }
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
`;
document.head.appendChild(styleSheet);

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState({});

  // Stagger animation for cards
  useEffect(() => {
    const cards = document.querySelectorAll('[data-anime-card]');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  }, [results]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);
    
    try {
      const res = await axios.get(`/api/anime/search?q=${query}`);
      setResults(res.data);
    } catch (error) {
      console.error("Search failed:", error);
      alert("Failed to search. Make sure your server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (animeId, value) => {
    setStatuses({ ...statuses, [animeId]: value });
  };

  const addToWatchlist = async (e,anime) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in first!");
      return;
    }

    const selectedStatus = statuses[anime.mal_id] || "plan_to_watch";

    const payload = {
      userId,
      animeId: anime.mal_id,
      title: anime.title,
      image: anime.image,
      genres: anime.genres,
      status: selectedStatus
    };

    try {
      await axios.post('/api/watchlist/add', payload);
      
      // Success feedback
      const btn = e.target;
      const originalText = btn.textContent;
btn.textContent = '✓ Secured';
      btn.style.background = 'rgba(223, 0, 0, 0.2)'; // Akatsuki Red instead of Green!
      btn.style.color = '#df0000';
      btn.style.borderColor = '#df0000';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = 'transparent';
        btn.style.color = '#df0000';
        btn.style.borderColor = '#df0000';
      }, 2000);
      
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      alert("Could not add to watchlist. Try again.");
    }
  };

  return (
    <div style={styles.container}>
      {/* BACKGROUND EFFECTS */}
      <div style={styles.backgroundPattern}></div>
      <div style={styles.eclipseGlow}></div>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.brandOfSacrifice}>⚔</div>
        <h1 style={styles.title}>DISCOVER ANIME</h1>
        <p style={styles.subtitle}>Struggle • Sacrifice • Survive</p>
      </div>

      {/* SEARCH BAR */}
      <form onSubmit={handleSearch} style={styles.searchWrapper}>
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Search the abyss... (e.g., Berserk, Vinland Saga)" 
          style={styles.input}
          onFocus={(e) => {
            e.target.style.borderColor = theme.colors.accent;
            e.target.style.boxShadow = `0 0 20px rgba(220, 38, 38, 0.3)`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.border;
            e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.5)';
          }}
        />
        <button 
          type="submit" 
          style={styles.searchBtn} 
          disabled={loading}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 0 30px rgba(220, 38, 38, 0.6)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = theme.shadows.glow;
          }}
        >
          {loading ? "SEARCHING..." : "SEARCH"}
        </button>
      </form>

      {/* LOADING STATE */}
      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Summoning results from the void...</p>
        </div>
      )}

      {/* RESULTS GRID */}
      {!loading && results.length > 0 && (
        <div style={styles.grid}>
          {results.map((anime, index) => (
            <div 
              key={anime.mal_id} 
              data-anime-card
              style={{
                ...styles.animeCard,
                animationDelay: `${index * 0.1}s`
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                e.currentTarget.style.boxShadow = theme.shadows.card;
                e.currentTarget.style.borderColor = theme.colors.accent;
                
                const img = e.currentTarget.querySelector('img');
                if (img) {
                  img.style.transform = 'scale(1.1)';
                  img.style.filter = 'brightness(1) contrast(1.2)';
                }
                
                const overlay = e.currentTarget.querySelector('[data-overlay]');
                if (overlay) overlay.style.opacity = '1';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
                e.currentTarget.style.borderColor = theme.colors.border;
                
                const img = e.currentTarget.querySelector('img');
                if (img) {
                  img.style.transform = 'scale(1)';
                  img.style.filter = 'brightness(0.9) contrast(1.1)';
                }
                
                const overlay = e.currentTarget.querySelector('[data-overlay]');
                if (overlay) overlay.style.opacity = '0';
              }}
            >
              <div style={styles.imageWrapper}>
                <img src={anime.image} alt={anime.title} style={styles.animeImage} />
                <div data-overlay style={styles.imageOverlay}></div>
                {anime.score && (
                  <div style={styles.scoreBadge}>★ {anime.score}</div>
                )}
              </div>

              <div style={styles.animeInfo}>
                <h4 style={styles.animeTitle}>{anime.title}</h4>
                
                <div style={styles.animeMetadata}>
                  <div style={styles.metadataRow}>
                    <span>{anime.type || 'TV'}</span>
                    <span style={styles.separator}>•</span>
                    <span>{anime.episodes ? `${anime.episodes} Eps` : 'Ongoing'}</span>
                  </div>
                  {anime.year && (
                    <div style={styles.metadataRow}>
                      <span>📅 {anime.year}</span>
                    </div>
                  )}
                </div>

                {/* GENRES */}
                {anime.genres && anime.genres.length > 0 && (
                  <div style={styles.genresContainer}>
                    {anime.genres.slice(0, 3).map((genre, i) => (
                      <span key={i} style={styles.genreTag}>{genre}</span>
                    ))}
                  </div>
                )}

                {/* ACTIONS */}
                <div style={styles.actionsWrapper}>
                  <select 
                    style={styles.select}
                    value={statuses[anime.mal_id] || "plan_to_watch"}
                    onChange={(e) => handleStatusChange(anime.mal_id, e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.accent;
                      e.target.style.boxShadow = `0 0 15px rgba(220, 38, 38, 0.2)`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.border;
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="watching">⚔ Watching</option>
                    <option value="plan_to_watch">📋 Plan to Watch</option>
                    <option value="completed">✓ Completed</option>
                    <option value="dropped">✗ Dropped</option>
                  </select>
                  
                  <button 
                    style={styles.addBtn} 
                   onClick={(e) => addToWatchlist(e, anime)}
                    onMouseOver={(e) => {
                      e.target.style.background = `linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(153, 27, 27, 0.3) 100%)`;
                      e.target.style.borderColor = theme.colors.accent;
                      e.target.style.transform = 'scale(1.02)';
                      e.target.style.boxShadow = '0 0 20px rgba(220, 38, 38, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = `linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(153, 27, 27, 0.15) 100%)`;
                      e.target.style.borderColor = theme.colors.border;
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    + Add to Watchlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && results.length === 0 && query && (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>⚔</div>
          <p style={styles.emptyStateText}>No anime found in this realm...</p>
        </div>
      )}
    </div>
  );
}

export default Search;

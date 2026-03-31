import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchBar from './Searchbar'; 

// 🩸 AKATSUKI THEME PALETTE
const theme = {
  colors: {
    surface: '#050505',          // Pitch black cloak
    text: '#e2e8f0',             // Pale white
    crimson: '#df0000',          // Akatsuki Cloud Red
    darkBlood: '#5c0000',        // Dried blood border
  },
  typography: {
    h2: { fontFamily: "'Cinzel', serif", fontWeight: '800', letterSpacing: '4px' }
  }
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    background: "rgba(5, 5, 5, 0.95)", // Almost solid black
    backdropFilter: "blur(12px)", 
    borderBottom: `2px solid ${theme.colors.darkBlood}`,
    boxShadow: `0 8px 30px rgba(223, 0, 0, 0.15)`, // Ominous red underglow
    position: "sticky",
    top: 0,
    zIndex: 1000,
    transition: "all 0.4s ease-in-out",
  },
  logo: {
    fontFamily: theme.typography.h2.fontFamily,
    fontWeight: theme.typography.h2.fontWeight,
    letterSpacing: theme.typography.h2.letterSpacing,
    cursor: "pointer",
    margin: 0,
    flex: 1,
    color: theme.colors.text,
    transition: "all 0.4s ease",
    textTransform: "uppercase",
  },
  searchContainer: {
    flex: 2,
    display: "flex",
    justifyContent: "center",
    maxWidth: "450px",
  },
  links: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  
  // 🗡️ Rogue Ninja Link Buttons
  navBtn: (isActive) => ({
    padding: "8px 15px",
    background: "transparent",
    border: "none",
    borderBottom: `2px solid ${isActive ? theme.colors.crimson : 'transparent'}`,
    color: isActive ? theme.colors.crimson : theme.colors.text,
    cursor: "pointer",
    fontFamily: "'Cinzel', serif",
    fontWeight: "700",
    letterSpacing: "2px",
    textTransform: "uppercase",
    transition: "all 0.3s ease",
    textShadow: isActive ? `0 0 15px rgba(223, 0, 0, 0.6)` : 'none',
  }),
  
  // 🩸 Execute/Post Button
  postBtn: {
    padding: "8px 25px",
    background: `linear-gradient(135deg, ${theme.colors.darkBlood} 0%, ${theme.colors.crimson} 100%)`,
    border: `1px solid ${theme.colors.crimson}`,
    color: "#fff",
    borderRadius: "2px", // Sharp, deadly corners
    cursor: "pointer",
    fontFamily: "'Cinzel', serif",
    fontWeight: "800",
    letterSpacing: "2px",
    textTransform: "uppercase",
    boxShadow: `0 4px 15px rgba(223, 0, 0, 0.3)`,
    marginLeft: "15px",
    transition: "all 0.3s ease-in-out",
  }
};

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
if (location.pathname === '/') {
    return null; }
    
  return (
    <div style={styles.nav}>
      
      {/* 🔴 LOGO (The Dawn) */}
      <h2 
        style={styles.logo} 
        onClick={() => navigate("/feed")}
        onMouseEnter={(e) => {
          e.target.style.color = theme.colors.crimson;
          e.target.style.textShadow = `0 0 20px ${theme.colors.crimson}`;
          e.target.style.letterSpacing = '6px'; // Spreads out menacingly
        }}
        onMouseLeave={(e) => {
          e.target.style.color = theme.colors.text;
          e.target.style.textShadow = 'none';
          e.target.style.letterSpacing = theme.typography.h2.letterSpacing;
        }}
      >
        OTAKU VERSE
      </h2>

      {/* 👁️ SEARCH BAR (The Sharingan / Scout) */}
      <div style={styles.searchContainer}>
        <SearchBar />
      </div>

      {/* 🗡️ NAVIGATION LINKS (The Rings) */}
      <div style={styles.links}>
        {['/feed', '/search', '/profile'].map((path) => {
          // Akatsuki Terminology (Intel = Feed, Recon = Discover, Hideout = Profile)
          const labels = { '/feed': 'Feed', '/search': 'Search', '/profile': 'Profile' };
          const isActive = location.pathname === path;
          
          return (
            <button 
              key={path}
              style={styles.navBtn(isActive)} 
              onClick={() => navigate(path)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.color = theme.colors.crimson;
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.color = theme.colors.text;
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {labels[path]}
            </button>
          );
        })}

        {/* 🩸 CREATE POST BUTTON (Execute) */}
        <button 
          style={styles.postBtn} 
          onClick={() => navigate("/create")}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = `0 0 25px ${theme.colors.crimson}`;
            e.target.style.background = theme.colors.crimson;
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = `0 4px 15px rgba(223, 0, 0, 0.3)`;
            e.target.style.background = `linear-gradient(135deg, ${theme.colors.darkBlood} 0%, ${theme.colors.crimson} 100%)`;
            e.target.style.transform = 'scale(1)';
          }}
        >
          Create Post
        </button>
      </div>

    </div>
  );
}

export default Navbar;
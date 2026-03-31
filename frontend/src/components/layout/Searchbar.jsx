import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false); // 🔥 Tracks if they are typing

  useEffect(() => {
    const fetchUsers = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      try {
        const res = await axios.get(`/api/users/search?q=${query}`);
        setResults(res.data);
      } catch (err) {
        console.error("Search error", err);
      }
    };

    const timeoutId = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "350px" }}>
      
      {/* 🔍 Search Icon (Absolute positioned inside the input) */}
      <span style={{
        position: "absolute",
        left: "15px",
        top: "50%",
        transform: "translateY(-50%)",
        color: isFocused ? "#00e6e6" : "#a1a1aa", // Glows cyan when active!
        transition: "color 0.3s ease",
        pointerEvents: "none",
        fontSize: "1rem"
      }}>
      </span>

      {/* 📥 The Input Field */}
      <input
        type="text"
        placeholder=" ⌕ Scout for Ninjas..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          // Small delay on blur so they can actually click the links!
          setTimeout(() => setIsFocused(false), 200);
        }}
        style={{
          width: "100%", 
          padding: "10px 15px 10px 45px", // Extra left padding for the icon
          background: isFocused ? "rgba(0, 230, 230, 0.03)" : "rgba(255, 255, 255, 0.05)", 
          border: `1px solid ${isFocused ? "#00e6e6" : "rgba(255, 77, 77, 0.3)"}`, 
          color: "#e2e8f0", 
          borderRadius: "25px", // Sleek pill shape
          fontFamily: "'Cinzel', serif",
          letterSpacing: "1px",
          outline: "none",
          transition: "all 0.3s ease",
          boxShadow: isFocused ? "0 0 15px rgba(0, 230, 230, 0.2)" : "none",
        }}
      />
      
      {/* 📜 The Results Dropdown Scroll */}
      {results.length > 0 && isFocused && (
        <div style={{
          position: "absolute", 
          top: "120%", // Gives it a little breathing room below the input
          left: 0, 
          right: 0, 
          background: "rgba(13, 13, 13, 0.95)", // Deep Anbu Black
          backdropFilter: "blur(10px)", // Glass effect
          border: "1px solid rgba(255, 77, 77, 0.4)", 
          borderRadius: "12px", // Smooth corners
          zIndex: 9999, // Guarantees it floats above everything
          overflow: "hidden", // Keeps the hover effects inside the rounded corners
          boxShadow: "0 8px 32px rgba(255, 77, 77, 0.15)"
        }}>
          {results.map((u) => (
            <Link 
              key={u._id} 
              to={`/profile/${u._id}`} 
              onClick={() => { setQuery(""); setResults([]); }} 
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 230, 230, 0.1)";
                e.currentTarget.style.paddingLeft = "20px"; // Slides right slightly on hover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.paddingLeft = "15px";
              }}
              style={{
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                padding: "12px 15px", 
                color: "#f5e6d3", 
                textDecoration: "none",
                borderBottom: "1px solid rgba(255, 77, 77, 0.1)",
                transition: "all 0.2s ease"
              }}
            >
              <img 
                src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=random`} 
                alt="avatar" 
                style={{ 
                  width: "35px", 
                  height: "35px", 
                  borderRadius: "50%",
                  border: "2px solid rgba(255, 77, 77, 0.5)" // Red ring around avatars
                }}
              />
              <span style={{ fontWeight: "600", letterSpacing: "0.5px" }}>@{u.username}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
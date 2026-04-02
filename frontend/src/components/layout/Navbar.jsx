import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchBar from './Searchbar';
import { useAuth } from '../../context/AuthContext';

// ─── Akatsuki theme (unchanged) ───────────────────────────────────────────────
const theme = {
  colors: {
    surface:   '#050505',
    text:      '#e2e8f0',
    crimson:   '#df0000',
    darkBlood: '#5c0000',
  },
  typography: {
    h2: { fontFamily: "'Cinzel', serif", fontWeight: '800', letterSpacing: '4px' },
  },
};

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '15px 30px',
    background: 'rgba(5, 5, 5, 0.95)', backdropFilter: 'blur(12px)',
    borderBottom: `2px solid ${theme.colors.darkBlood}`,
    boxShadow: `0 8px 30px rgba(223, 0, 0, 0.15)`,
    position: 'sticky', top: 0, zIndex: 1000,
    transition: 'all 0.4s ease-in-out',
  },
  logo: {
    fontFamily: theme.typography.h2.fontFamily,
    fontWeight: theme.typography.h2.fontWeight,
    letterSpacing: theme.typography.h2.letterSpacing,
    cursor: 'pointer', margin: 0, flex: 1,
    color: theme.colors.text, transition: 'all 0.4s ease', textTransform: 'uppercase',
  },
  searchContainer: { flex: 2, display: 'flex', justifyContent: 'center', maxWidth: '450px' },
  links: { display: 'flex', gap: '20px', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  navBtn: (isActive) => ({
    padding: '8px 15px', background: 'transparent', border: 'none',
    borderBottom: `2px solid ${isActive ? theme.colors.crimson : 'transparent'}`,
    color: isActive ? theme.colors.crimson : theme.colors.text,
    cursor: 'pointer', fontFamily: "'Cinzel', serif", fontWeight: '700',
    letterSpacing: '2px', textTransform: 'uppercase', transition: 'all 0.3s ease',
    textShadow: isActive ? `0 0 15px rgba(223, 0, 0, 0.6)` : 'none',
  }),
  postBtn: {
    padding: '8px 25px',
    background: `linear-gradient(135deg, ${theme.colors.darkBlood} 0%, ${theme.colors.crimson} 100%)`,
    border: `1px solid ${theme.colors.crimson}`,
    color: '#fff', borderRadius: '2px', cursor: 'pointer',
    fontFamily: "'Cinzel', serif", fontWeight: '800',
    letterSpacing: '2px', textTransform: 'uppercase',
    boxShadow: `0 4px 15px rgba(223, 0, 0, 0.3)`,
    marginLeft: '15px', transition: 'all 0.3s ease-in-out',
  },
  // ── New: logout / username pill ──────────────────────────────────────────
  userPill: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '6px 14px',
    border: `1px solid ${theme.colors.darkBlood}`,
    borderRadius: 2,
    fontFamily: "'Cinzel', serif", fontSize: '.68rem', letterSpacing: '2px',
  },
  logoutBtn: {
    background: 'transparent', border: 'none',
    color: theme.colors.crimson, cursor: 'pointer',
    fontFamily: "'Cinzel', serif", fontWeight: 700,
    fontSize: '.65rem', letterSpacing: '2px', textTransform: 'uppercase',
    padding: '6px 12px',
    borderBottom: `1px solid transparent`,
    transition: 'border-color .2s, text-shadow .2s',
  },
};

function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  // Hide navbar on the login / root page
  if (location.pathname === '/') return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div style={styles.nav}>

      {/* Logo */}
      <h2
        style={styles.logo}
        onClick={() => navigate('/feed')}
        onMouseEnter={(e) => { e.target.style.color = theme.colors.crimson; e.target.style.textShadow = `0 0 20px ${theme.colors.crimson}`; e.target.style.letterSpacing = '6px'; }}
        onMouseLeave={(e) => { e.target.style.color = theme.colors.text;    e.target.style.textShadow = 'none';                              e.target.style.letterSpacing = theme.typography.h2.letterSpacing; }}
      >
        OTAKU VERSE
      </h2>

      {/* Search bar */}
      <div style={styles.searchContainer}>
        <SearchBar />
      </div>

      {/* Nav links */}
      <div style={styles.links}>
        {['/feed', '/search', '/profile'].map((path) => {
          const labels   = { '/feed': 'Feed', '/search': 'Search', '/profile': 'Profile' };
          const isActive = location.pathname.startsWith(path);

          return (
            <button
              key={path}
              style={styles.navBtn(isActive)}
              onClick={() => navigate(path === '/profile' ? `/profile/${user?.id}` : path)}
              onMouseEnter={(e) => { if (!isActive) { e.target.style.color = theme.colors.crimson; e.target.style.transform = 'translateY(-2px)'; } }}
              onMouseLeave={(e) => { if (!isActive) { e.target.style.color = theme.colors.text;    e.target.style.transform = 'translateY(0)';    } }}
            >
              {labels[path]}
            </button>
          );
        })}

        {/* Create Post */}
        <button
          style={styles.postBtn}
          onClick={() => navigate('/create')}
          onMouseEnter={(e) => { e.target.style.boxShadow = `0 0 25px ${theme.colors.crimson}`; e.target.style.background = theme.colors.crimson; e.target.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.target.style.boxShadow = `0 4px 15px rgba(223, 0, 0, 0.3)`; e.target.style.background = `linear-gradient(135deg, ${theme.colors.darkBlood} 0%, ${theme.colors.crimson} 100%)`; e.target.style.transform = 'scale(1)'; }}
        >
          Create Post
        </button>

        {/* ── User info + logout ── */}
        {user && (
          <div style={styles.userPill}>
            <span style={{ color: theme.colors.text, opacity: .6 }}>⚔</span>
            <span style={{ color: theme.colors.text, fontSize: '.68rem' }}>{user.username}</span>
            {/* Show role badge for admins / moderators */}
            {user.role !== 'user' && (
              <span style={{ color: theme.colors.crimson, fontSize: '.55rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                [{user.role}]
              </span>
            )}
            <button
              style={styles.logoutBtn}
              onClick={handleLogout}
              onMouseEnter={(e) => { e.target.style.borderBottomColor = theme.colors.crimson; e.target.style.textShadow = `0 0 10px ${theme.colors.crimson}`; }}
              onMouseLeave={(e) => { e.target.style.borderBottomColor = 'transparent';        e.target.style.textShadow = 'none'; }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;

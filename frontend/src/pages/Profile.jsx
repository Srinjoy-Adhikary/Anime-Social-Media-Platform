import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// ─── GEAR 5 / CONQUEROR'S HAKI PALETTE (unchanged) ───────────────────────────
const C = {
  void:       '#06070c', obsidian:   '#0c0e18', surface:    '#111525',
  border:     'rgba(255,255,255,0.06)', borderGold: 'rgba(212,170,60,0.28)',
  gold:       '#d4aa3c', goldBright: '#f0cc6a', goldDim:    '#7a6020',
  white:      '#efefef', whiteDim:   'rgba(239,239,239,0.55)', red: '#a83230',
};

// ─── INJECTED GLOBAL STYLES (unchanged) ──────────────────────────────────────
const $s = document.createElement('style');
$s.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes spinCW    { to{transform:rotate(360deg)} }
  @keyframes goldShimmer { 0%{background-position:-300% center} 100%{background-position:300% center} }
  @keyframes crackGlow {
    0%  {box-shadow:0 0 0   0   rgba(212,170,60,0.00)}
    45% {box-shadow:0 0 30px 5px rgba(212,170,60,0.38)}
    100%{box-shadow:0 0 14px 1px rgba(212,170,60,0.14)}
  }
  .enter-profile   { animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) both }
  .enter-watchlist { animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.11s both }
  .enter-card      { animation:fadeIn 0.38s ease both }
  .shimmer-gold {
    background:linear-gradient(110deg,#7a5c1a 0%,#d4aa3c 30%,#f5d878 50%,#d4aa3c 70%,#7a5c1a 100%);
    background-size:300% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text; animation:goldShimmer 8s linear infinite;
  }
  .avatar-ring { animation:crackGlow 1.1s ease-out 0.35s forwards }
  .anime-card  { transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease }
  .anime-card:hover { transform:translateY(-8px); box-shadow:0 26px 56px rgba(0,0,0,.88),0 0 30px rgba(212,170,60,.13) !important; border-color:rgba(212,170,60,.40) !important; }
  .anime-card:hover .cimg { transform:scale(1.08); filter:brightness(.9) saturate(1.2) }
  .anime-card:hover .covr { opacity:1 !important }
  .btn { transition:transform .17s ease,filter .17s ease; cursor:pointer }
  .btn:hover  { transform:translateY(-2px); filter:brightness(1.18) }
  .btn:active { transform:translateY(0);    filter:brightness(.95)  }
  input:focus, textarea:focus, select:focus { outline:none; border-color:rgba(212,170,60,.52) !important; box-shadow:0 0 0 2px rgba(212,170,60,.07) !important; }
  select option { background:#111525; color:#d4aa3c }
  ::-webkit-scrollbar { width:5px } ::-webkit-scrollbar-track { background:#06070c } ::-webkit-scrollbar-thumb { background:#1e2235; border-radius:3px }
`;
document.head.appendChild($s);

// ─── STATUS CONFIG (unchanged) ────────────────────────────────────────────────
const STATUS = {
  watching:      { label:'WATCHING',      color:'#d4aa3c', bg:'rgba(212,170,60,.10)', border:'rgba(212,170,60,.32)' },
  completed:     { label:'COMPLETED',     color:'#4caf82', bg:'rgba(76,175,130,.10)', border:'rgba(76,175,130,.28)' },
  plan_to_watch: { label:'PLAN TO WATCH', color:'#7ea8d4', bg:'rgba(126,168,212,.08)',border:'rgba(126,168,212,.24)' },
  dropped:       { label:'DROPPED',       color:'#a83230', bg:'rgba(168,50,48,.10)',  border:'rgba(168,50,48,.28)'  },
};
const sc = (s) => STATUS[s] || STATUS.plan_to_watch;

// ─── TINY CORNER BRACKETS (unchanged) ────────────────────────────────────────
function Brackets({ sz = 11, t = 1.5, col = C.gold }) {
  const base = { position:'absolute', width:sz, height:sz, borderColor:col, borderStyle:'solid' };
  return <>
    <span style={{...base, top:0,    left:0,  borderWidth:`${t}px 0 0 ${t}px`}} />
    <span style={{...base, top:0,    right:0, borderWidth:`${t}px ${t}px 0 0`}} />
    <span style={{...base, bottom:0, left:0,  borderWidth:`0 0 ${t}px ${t}px`}} />
    <span style={{...base, bottom:0, right:0, borderWidth:`0 ${t}px ${t}px 0`}} />
  </>;
}

function Divider({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:16, margin:'0 0 34px' }}>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,transparent,${C.borderGold})` }} />
      <span style={{ fontFamily:"'Cinzel',serif", fontSize:'.67rem', letterSpacing:'5px', color:C.goldDim, whiteSpace:'nowrap' }}>{label}</span>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${C.borderGold},transparent)` }} />
    </div>
  );
}

const btnBase = { fontFamily:"'Cinzel',serif", fontWeight:700, textTransform:'uppercase', border:'1px solid', borderRadius:2, backdropFilter:'blur(6px)' };
const mkBtn = (v) => ({
  ...btnBase,
  ...(v === 'gold'  && { background:'rgba(212,170,60,.08)', color:C.gold,                 borderColor:'rgba(212,170,60,.32)', padding:'10px 22px', fontSize:'.68rem', letterSpacing:'2.5px' }),
  ...(v === 'red'   && { background:'rgba(168,50,48,.08)',  color:'#c04442',              borderColor:'rgba(168,50,48,.30)', padding:'10px 22px', fontSize:'.68rem', letterSpacing:'2.5px' }),
  ...(v === 'ghost' && { background:'transparent',         color:'rgba(239,239,239,.45)', borderColor:'rgba(255,255,255,.12)', padding:'10px 22px', fontSize:'.68rem', letterSpacing:'2.5px' }),
  ...(v === 'mini'  && { background:'transparent',         padding:'7px 14px',            fontSize:'.6rem', letterSpacing:'1.5px' }),
});

const inputBase = {
  width:'100%', background:'rgba(255,255,255,.03)', border:'1px solid rgba(212,170,60,.16)',
  borderRadius:2, textTransform:'none', padding:'11px 14px', color:C.white,
  fontFamily:"'Cinzel',serif", fontSize:'.82rem', transition:'border-color .2s, box-shadow .2s',
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function Profile() {
  const { id }              = useParams();
  const navigate            = useNavigate();
  const { user: authUser, logout } = useAuth(); // ← from context, not localStorage

  // If no :id in URL, treat as own profile
  const isOwnProfile = !id || id === authUser?.id;
  const profileId    = isOwnProfile ? authUser?.id : id;

  const [user,               setUser]              = useState(null);
  const [loading,            setLoading]           = useState(true);
  const [isEditing,          setIsEditing]         = useState(false);
  const [watchlistStatuses,  setWatchlistStatuses] = useState({});
  const [formData,           setFormData]          = useState({ username:'', email:'', bio:'', avatar:'', password:'' });
  const [saveError,          setSaveError]         = useState('');

  useEffect(() => {
    (async () => {
      try {
        // /me uses the cookie; /:id is public
        const { data } = await axios.get(isOwnProfile ? '/api/users/me' : `/api/users/${id}`);
        setUser(data);
        if (data.watchlist) {
          const init = {};
          data.watchlist.forEach(a => { init[a.animeId] = a.status; });
          setWatchlistStatuses(init);
        }
        if (isOwnProfile) {
          setFormData({ username: data.username||'', email: data.email||'', bio: data.bio||'', avatar: data.avatar||'', password: '' });
        }
      } catch (e) {
        console.error('Profile fetch failed:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isOwnProfile]);

  const onInput  = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  // ── Logout via context (clears cookie + user state) ──────────────────────
  const onLogout = async () => {
    await logout();
    navigate('/');
  };

  // ── Save profile ─────────────────────────────────────────────────────────
  const onSave = async () => {
    setSaveError('');
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;

      const { data } = await axios.put(`/api/users/${profileId}`, payload);
      setUser(data);
      setIsEditing(false);
      setFormData(p => ({ ...p, password: '' }));
    } catch (e) {
      console.error(e);
      setSaveError(e.response?.data?.message || 'Failed to update profile.');
    }
  };

  const onStatusChange  = (id, val) => setWatchlistStatuses(p => ({ ...p, [id]: val }));

  const onUpdateStatus = async (anime) => {
    try {
      const status = watchlistStatuses[anime.animeId];
      await axios.post('/api/watchlist/add', {
        userId: authUser.id, animeId: anime.animeId,
        title: anime.title, image: anime.image, genres: anime.genres, status,
      });
      setUser(p => ({ ...p, watchlist: p.watchlist.map(i => i.animeId === anime.animeId ? { ...i, status } : i) }));
    } catch (e) { console.error(e); }
  };

  const onRemove = async (animeId) => {
    if (!window.confirm('Remove this title from your list?')) return;
    try {
      await axios.delete('/api/watchlist/remove', { data: { userId: authUser.id, animeId } });
      setUser(p => ({ ...p, watchlist: p.watchlist.filter(i => i.animeId !== animeId) }));
      setWatchlistStatuses(p => { const n = { ...p }; delete n[animeId]; return n; });
    } catch (e) { console.error(e); }
  };

  // ── States ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:'100vh', background:C.void, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14 }}>
      <span style={{ fontSize:'1.8rem', display:'inline-block', animation:'spinCW 1.4s linear infinite' }}>⚙</span>
      <p style={{ fontFamily:"'Cinzel',serif", color:C.goldDim, fontSize:'.7rem', letterSpacing:'5px' }}>AWAKENING</p>
    </div>
  );

  if (!user) return (
    <div style={{ minHeight:'100vh', background:C.void, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ fontFamily:"'Cinzel',serif", color:C.red, fontSize:'1.1rem', letterSpacing:'3px' }}>USER NOT FOUND</p>
    </div>
  );

  const bounty = ((user.username?.length || 1) * 50_000_000).toLocaleString();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:'100vh', background:C.void, padding:'64px 20px 96px',
      display:'flex', flexDirection:'column', alignItems:'center',
      fontFamily:"'Cinzel',serif", position:'relative', overflow:'hidden',
    }}>
      <div aria-hidden style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:`radial-gradient(ellipse 56% 42% at 18% 26%,rgba(212,170,60,.045) 0%,transparent 70%),
                    radial-gradient(ellipse 38% 50% at 82% 72%,rgba(212,170,60,.03) 0%,transparent 70%)` }} />
      <div aria-hidden style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', opacity:.03,
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* ═══════ PROFILE CARD ═══════ */}
      <div className="enter-profile" style={{
        position:'relative', zIndex:1, width:'100%', maxWidth:490,
        background:C.obsidian, border:`1px solid rgba(212,170,60,.18)`,
        boxShadow:'0 32px 80px rgba(0,0,0,.92), 0 0 0 1px rgba(255,255,255,.02)', overflow:'hidden',
      }}>
        <div style={{ height:2, background:`linear-gradient(90deg,transparent,${C.gold} 25%,${C.goldBright} 50%,${C.gold} 75%,transparent)` }} />

        {!isEditing && (
          <div style={{ padding:'24px 34px 18px', display:'flex', flexDirection:'column', alignItems:'center', gap:3, borderBottom:`1px solid ${C.border}`, background:'linear-gradient(180deg,rgba(212,170,60,.04) 0%,transparent 100%)' }}>
            <p style={{ margin:0, fontSize:'.58rem', letterSpacing:'7px', color:C.goldDim, fontWeight:600 }}>WORLD GOVERNMENT</p>
            <h1 className="shimmer-gold" style={{ margin:'4px 0', fontSize:'4rem', fontWeight:900, letterSpacing:'10px', lineHeight:1 }}>WANTED</h1>
            <p style={{ margin:0, fontSize:'.58rem', letterSpacing:'9px', color:'rgba(168,50,48,.78)', fontWeight:600 }}>DEAD OR ALIVE</p>
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'center', padding: isEditing ? '34px 34px 0' : '26px 34px 0' }}>
          <div className="avatar-ring" style={{ width:165, height:205, border:`1.5px solid rgba(212,170,60,.36)`, position:'relative', overflow:'hidden', background:'#000', flexShrink:0 }}>
            <Brackets sz={12} t={1.5} col={C.gold} />
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=181d2e&color=d4aa3c&size=200`}
              alt="avatar"
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', filter:'brightness(.87) contrast(1.08)' }}
            />
          </div>
        </div>

        <div style={{ padding:'20px 34px 32px' }}>
          {!isEditing ? (
            <>
              <h2 className="shimmer-gold" style={{ fontSize:'1.8rem', fontWeight:700, letterSpacing:'3px', textAlign:'center', margin:'0 0 16px' }}>
                {user.username}
              </h2>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'12px 14px', margin:'0 0 14px', borderTop:`1px solid ${C.borderGold}`, borderBottom:`1px solid ${C.borderGold}`, background:'rgba(212,170,60,.03)' }}>
                <span style={{ color:C.goldDim, fontSize:'.58rem', letterSpacing:'4px', fontWeight:600 }}>BOUNTY</span>
                <span style={{ color:C.goldBright, fontSize:'1.5rem', fontWeight:700, letterSpacing:'1px' }}>฿ {bounty}</span>
              </div>
              {isOwnProfile && (
                <p style={{ textAlign:'center', color:'rgba(239,239,239,.27)', fontSize:'.7rem', letterSpacing:'2px', margin:'0 0 11px' }}>{user.email}</p>
              )}
              <p style={{ fontFamily:"'EB Garamond',serif", fontStyle:'italic', fontSize:'1.02rem', lineHeight:1.78, color:C.whiteDim, textAlign:'center', margin:'0 0 26px', padding:'0 6px' }}>
                "{user.bio || 'A legend whose story is still being written...'}"
              </p>
              <div style={{ display:'flex', gap:11, justifyContent:'center' }}>
                {isOwnProfile ? (
                  <>
                    <button className="btn" style={mkBtn('gold')} onClick={() => setIsEditing(true)}>Edit Profile</button>
                    <button className="btn" style={mkBtn('red')}  onClick={onLogout}>Log Out</button>
                  </>
                ) : (
                  <button className="btn" style={mkBtn('gold')}>⚔ Alliance</button>
                )}
              </div>
            </>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:15 }}>
              <p style={{ textAlign:'center', color:C.goldDim, fontSize:'.63rem', letterSpacing:'5px', margin:'0 0 2px' }}>EDIT PROFILE</p>

              {saveError && (
                <p style={{ color:'#ff4466', fontSize:'.68rem', letterSpacing:'1px', textAlign:'center', padding:'8px', background:'rgba(255,0,60,.08)', border:'1px solid rgba(255,0,60,.22)', borderRadius:2 }}>
                  ⚠ {saveError}
                </p>
              )}

              {[
                { name:'avatar',   label:'Avatar URL' },
                { name:'username', label:'Username'   },
                { name:'email',    label:'Email'      },
                { name:'password', label:'New Password', type:'password' },
              ].map(({ name, label, type='text' }) => (
                <div key={name} style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  <label style={{ fontSize:'.56rem', letterSpacing:'3px', color:C.goldDim, fontWeight:600 }}>{label.toUpperCase()}</label>
                  <input name={name} type={type} value={formData[name]} onChange={onInput} style={inputBase} />
                </div>
              ))}

              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                <label style={{ fontSize:'.56rem', letterSpacing:'3px', color:C.goldDim, fontWeight:600 }}>BIO</label>
                <textarea name="bio" value={formData.bio} onChange={onInput} style={{ ...inputBase, minHeight:95, resize:'vertical', lineHeight:1.6 }} />
              </div>

              <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:4 }}>
                <button className="btn" style={mkBtn('gold')}  onClick={onSave}>Save Changes</button>
                <button className="btn" style={mkBtn('ghost')} onClick={() => { setIsEditing(false); setSaveError(''); }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ WATCHLIST ═══════ */}
      <div className="enter-watchlist" style={{ width:'100%', maxWidth:1200, marginTop:68, position:'relative', zIndex:1 }}>
        <Divider label="CAPTAIN'S LOG" />

        {user.watchlist?.length > 0 ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(232px,1fr))', gap:20 }}>
            {user.watchlist.map((anime, i) => {
              const s = sc(watchlistStatuses[anime.animeId] || anime.status);
              return (
                <div key={anime.animeId} className="anime-card enter-card"
                  style={{ animationDelay:`${i*.05}s`, background:C.obsidian, border:`1px solid rgba(255,255,255,.07)`, overflow:'hidden', boxShadow:'0 8px 28px rgba(0,0,0,.7)', position:'relative' }}>
                  <div style={{ position:'relative', height:282, overflow:'hidden' }}>
                    <img className="cimg" src={anime.image} alt={anime.title}
                      style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', filter:'brightness(.8) saturate(1.05)', transition:'transform .3s ease, filter .3s ease' }} />
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 42%,rgba(6,7,12,.9) 100%)' }} />
                    <div className="covr" style={{ position:'absolute', inset:0, background:'rgba(6,7,12,.2)', opacity:0, transition:'opacity .25s ease' }} />
                    <div style={{ position:'absolute', top:10, left:10, padding:'5px 10px', background:s.bg, backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', border:`1px solid ${s.border}`, color:s.color, fontSize:'.8rem', letterSpacing:'2px', fontWeight:800, textShadow:'0 2px 5px rgba(0,0,0,0.9)', borderRadius:'4px', boxShadow:'0 4px 15px rgba(0,0,0,0.6)', zIndex:10 }}>
                      {s.label}
                    </div>
                  </div>
                  <div style={{ padding:'15px 15px 17px', background:C.surface }}>
                    <h4 style={{ margin:'0 0 4px', fontSize:'.87rem', fontWeight:600, color:C.white, lineHeight:1.35, letterSpacing:'.2px' }}>{anime.title}</h4>
                    <p  style={{ margin:`0 0 ${isOwnProfile?'13px':'0'}`, fontSize:'.63rem', color:'rgba(239,239,239,.28)', letterSpacing:'.7px' }}>
                      {anime.genres?.join(' · ') || 'Adventure'}
                    </p>
                    {isOwnProfile && (
                      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                        <select value={watchlistStatuses[anime.animeId] || anime.status} onChange={e => onStatusChange(anime.animeId, e.target.value)}
                          style={{ ...inputBase, padding:'7px 10px', fontSize:'.63rem', letterSpacing:'1px', cursor:'pointer' }}>
                          <option value="watching">Watching</option>
                          <option value="plan_to_watch">Plan to Watch</option>
                          <option value="completed">Completed</option>
                          <option value="dropped">Dropped</option>
                        </select>
                        <div style={{ display:'flex', gap:7 }}>
                          <button className="btn" onClick={() => onUpdateStatus(anime)} style={{ ...mkBtn('mini'), flex:1, color:C.gold, borderColor:'rgba(212,170,60,.28)' }}>Update</button>
                          <button className="btn" onClick={() => onRemove(anime.animeId)} style={{ ...mkBtn('mini'), color:'rgba(168,50,48,.85)', borderColor:'rgba(168,50,48,.28)' }}>Remove</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'68px 20px', border:`1px solid ${C.border}`, background:C.obsidian }}>
            <div style={{ fontSize:'1.8rem', marginBottom:12, opacity:.25 }}>⚓</div>
            <p style={{ color:'rgba(239,239,239,.22)', fontSize:'.7rem', letterSpacing:'4px' }}>NO TITLES LOGGED YET</p>
          </div>
        )}
      </div>
    </div>
  );
}

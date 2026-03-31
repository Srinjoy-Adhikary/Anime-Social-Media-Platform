import React from "react";

function Sidebar() {
  return (
    <div style={{width:"220px", background:"#1a1a1a", height:"100vh", color:"white"}}>
      <ul>
        <li>Home</li>
        <li>Trending</li>
        <li>Watchlist</li>
        <li>Profile</li>
      </ul>
    </div>
  );
}

export default Sidebar;
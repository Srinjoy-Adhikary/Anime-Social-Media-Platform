import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

// ─── Axios global defaults ────────────────────────────────────────────────────
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:5000";

// ─── Auth ─────────────────────────────────────────────────────────────────────
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute   from "./components/ProtectedRoute";

// ─── Pages & components ───────────────────────────────────────────────────────
import Login      from "./pages/Login";
import Feed       from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import Navbar     from "./components/layout/Navbar";
import Search     from "./components/anime/Search";
import Profile    from "./pages/Profile";

function App() {
  return (
    // AuthProvider must wrap Router so the Axios interceptor fires before any
    // route renders, and useAuth() is available everywhere inside the tree.
    <AuthProvider>
      <Router>
        <Navbar />

        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<Login />} />

          {/* ── Protected (any logged-in user) ── */}
          <Route path="/feed" element={
            <ProtectedRoute><Feed /></ProtectedRoute>
          } />

          <Route path="/create" element={
            <ProtectedRoute><CreatePost /></ProtectedRoute>
          } />

          <Route path="/search" element={
            <ProtectedRoute><Search /></ProtectedRoute>
          } />

          <Route path="/profile/:id?" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          {/* ── Admin-only example ── */}
          {/* <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
          } /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

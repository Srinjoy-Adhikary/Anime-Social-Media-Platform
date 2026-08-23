import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

// ─── Dynamic Axios Global Defaults ────────────────────────────────────────────
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Auth ─────────────────────────────────────────────────────────────────────
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute   from "./components/ProtectedRoute";

// ─── Pages & Components ───────────────────────────────────────────────────────
import Login      from "./pages/Login";
import Feed       from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import Navbar     from "./components/layout/Navbar";
import Search     from "./components/anime/Search";
import Profile    from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />

        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<Login />} />

          {/* ── Protected ── */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />

          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/:id?"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
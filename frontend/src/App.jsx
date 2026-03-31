import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
axios.defaults.withCredentials = true; // Tell Axios to always send cookies!
// axios.defaults.baseURL = "http://10.120.119.104:5000"; // Set your backend base URL here
axios.defaults.baseURL = "http://localhost:5000"; // Set your backend base URL here

import Login from "./pages/login";
import Feed from "./pages/feed";
import CreatePost from "./pages/CreatePost";
import Navbar from "./components/layout/Navbar";
import Search from './components/anime/Search';
import Profile from './pages/Profile';

function App() {
  return (<>
    <Router>
      <Navbar /> {/*MUST be inside Router and Ouside of Routes*/}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/create" element={<CreatePost />} />

        {/* ADD YOUR NEW ROUTES RIGHT HERE */}
        <Route path="/search" element={<Search />} />
      
        <Route path="/profile/:id?" element={<Profile />} />
      </Routes>


    </Router>
  </>
  );
}

export default App;
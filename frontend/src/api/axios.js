import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const baseURL = rawBaseURL.endsWith("/api")
  ? rawBaseURL
  : `${rawBaseURL.replace(/\/$/, "")}/api`;

const API = axios.create({
  baseURL,
  withCredentials: true,
});

// Intercept outgoing requests and attach JWT token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("otaku_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000';
const AuthContext = createContext(null);

// ─── Regex (mirrors backend) ──────────────────────────────────────────────────
export const EMAIL_REGEX    = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{8,}$/;

export function AuthProvider({ children }) {
  // user = { id, username, role } or null when logged out
  const [user,    setUser]    = useState(undefined); // undefined = "not yet checked"
  const [loading, setLoading] = useState(true);

  // ── On mount: verify the cookie is still valid by fetching /me ──────────────
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('/api/users/me');
        setUser({ id: data._id, username: data.username, role: data.role });
      } catch {
        setUser(null); // Not logged in or token expired
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Silent token refresh ────────────────────────────────────────────────────
  // Called automatically by the Axios interceptor below when a 401 w/ TOKEN_EXPIRED arrives.
  const refresh = useCallback(async () => {
    await axios.post('/api/auth/refresh'); // Backend rotates the access-token cookie
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    setUser({ id: data.user.id, username: data.user.username, role: data.user.role });
    return data;
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
  }, []);

  // ── Axios interceptor: auto-refresh on 401 TOKEN_EXPIRED ────────────────────
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config;
        const isExpired = error.response?.status === 401 &&
                          error.response?.data?.code === 'TOKEN_EXPIRED';

        // Prevent infinite retry loop
        if (isExpired && !original._retried) {
          original._retried = true;
          try {
            await refresh();
            return axios(original); // Replay the original request
          } catch {
            setUser(null); // Refresh also failed — force re-login
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

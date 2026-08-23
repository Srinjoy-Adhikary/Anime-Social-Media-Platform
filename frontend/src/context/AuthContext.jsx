import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios'; // Centralized Axios instance with baseURL ending in /api

const AuthContext = createContext(null);

// ─── Regex (mirrors backend) ──────────────────────────────────────────────────
export const EMAIL_REGEX    = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{8,}$/;

export function AuthProvider({ children }) {
  // 1. Initialize user from localStorage to eliminate UI state blips
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('otaku_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // ── Silent token refresh ────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    const { data } = await API.post('/auth/refresh');
    if (data?.token) {
      localStorage.setItem('otaku_token', data.token);
    }
    return data;
  }, []);

  // ── On mount: verify token validity against the backend ─────────────────────
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const token = localStorage.getItem('otaku_token');
      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await API.get('/users/me');
        const userData = { id: data._id || data.id, username: data.username, role: data.role };
        if (isMounted) {
          setUser(userData);
          localStorage.setItem('otaku_user', JSON.stringify(userData));
        }
      } catch (err) {
        if (isMounted && err.response?.status === 401) {
          setUser(null);
          localStorage.removeItem('otaku_user');
          localStorage.removeItem('otaku_token');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    
    // Store Bearer token
    if (data.token) {
      localStorage.setItem('otaku_token', data.token);
    }
    
    // Store user state
    const userData = { 
      id: data.user?.id || data.user?._id, 
      username: data.user?.username, 
      role: data.user?.role 
    };
    setUser(userData);
    localStorage.setItem('otaku_user', JSON.stringify(userData));
    return data;
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    localStorage.removeItem('otaku_user');
    localStorage.removeItem('otaku_token');
  }, []);

  // ── Axios interceptor: auto-refresh on 401 TOKEN_EXPIRED ────────────────────
  useEffect(() => {
    const interceptor = API.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config;
        const isExpired =
          error.response?.status === 401 &&
          error.response?.data?.code === 'TOKEN_EXPIRED';

        // Prevent infinite retry loop
        if (isExpired && !original._retried) {
          original._retried = true;
          try {
            const data = await refresh();
            if (data?.token) {
              original.headers.Authorization = `Bearer ${data.token}`;
            }
            return API(original); // Replay original request
          } catch {
            setUser(null);
            localStorage.removeItem('otaku_user');
            localStorage.removeItem('otaku_token');
          }
        }
        return Promise.reject(error);
      }
    );
    return () => API.interceptors.response.eject(interceptor);
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
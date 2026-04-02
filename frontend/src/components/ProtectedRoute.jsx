import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps any route that requires authentication.
 *
 * Usage:
 *   <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
 *
 * For admin-only routes:
 *   <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While the /me check is in flight, show nothing (avoids flash of redirect)
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#06070c',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        fontFamily: "'Cinzel', serif",
      }}>
        <span style={{ fontSize: '1.8rem', display: 'inline-block', animation: 'spinCW 1.4s linear infinite' }}>⚙</span>
        <p style={{ color: '#7a6020', fontSize: '.7rem', letterSpacing: '5px' }}>VERIFYING REIATSU</p>
      </div>
    );
  }

  // Not logged in → redirect to login, remembering where they wanted to go
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to feed (or a dedicated 403 page)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/feed" replace />;
  }

  return children;
}

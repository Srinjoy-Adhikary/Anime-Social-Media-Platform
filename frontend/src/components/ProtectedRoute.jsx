import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Reusable full-screen animated loader matching the Gear 5 / Shimmer theme.
 * Extracted here to prevent redundant object creation on engine renders.
 */
const ReiatsuLoader = () => (
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
    <span style={{ 
      fontSize: '1.8rem', 
      display: 'inline-block', 
      animation: 'spinCW 1.4s linear infinite' 
    }}>
      ⚙
    </span>
    <p style={{ color: '#7a6020', fontSize: '.7rem', letterSpacing: '5px', margin: 0 }}>
      VERIFYING REIATSU
    </p>
  </div>
);

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = "/feed" 
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. While the backend verification (/api/users/me) is active, show the loader
  if (loading) {
    return <ReiatsuLoader />;
  }

  // 2. Unauthenticated -> Kick back to lander, remembering their target URL
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 3. Authenticated but lacks structural authorization permissions
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  // 4. Access Granted
  return children;
}
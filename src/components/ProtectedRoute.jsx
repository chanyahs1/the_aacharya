import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();
  const isHRAuthenticated = localStorage.getItem('hrAuthenticated') === 'true';

  if (requiredRole === 'hr' && !isHRAuthenticated) {
    return <Navigate to="/hr-login" state={{ from: location }} replace />;
  }

  return children;
}
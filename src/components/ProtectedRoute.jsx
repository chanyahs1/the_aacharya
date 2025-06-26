import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

function isTokenValid(token) {
  try {
    const { exp } = jwtDecode(token);
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
}

export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();

    if (requiredRole === 'hr') {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      return <Navigate to="/hr-login" state={{ from: location }} replace />;
    }
  }

  if (requiredRole === 'employee') {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      return <Navigate to="/employee-login" state={{ from: location }} replace />;
    }
  }

  return children;
}
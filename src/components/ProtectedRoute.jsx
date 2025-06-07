import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();
  const isHRAuthenticated = localStorage.getItem('hrAuthenticated') === 'true';
  const isEmployeeAuthenticated = 
    localStorage.getItem('currentEmployee') !== null || 
    sessionStorage.getItem('currentEmployee') !== null;

  if (requiredRole === 'hr' && !isHRAuthenticated) {
    return <Navigate to="/hr-login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'employee' && !isEmployeeAuthenticated) {
    return <Navigate to="/employee-login" state={{ from: location }} replace />;
  }

  return children;
}
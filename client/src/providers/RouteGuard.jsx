import { useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
//import { isLoggedIn } from '../api/auth';
import { useAuth } from '../hooks';

const RouteGuard = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth('RouteGuard');
  console.log('[RouteGuard]: ', user);
  useEffect(() => {
    console.log('[RouteGuard], useEffect: ', user);
  }, []);

  if (!user && location.pathname !== '/login') {
    console.log('[RouteGuard] REDIRECT');
    return <Navigate to="/login" state={{ from: location }} />;
  }
  console.log('[RouteGuard] render childs');
  return children;
};

export default RouteGuard;

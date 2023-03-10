import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';

const RouteGuard = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;
};

export default RouteGuard;

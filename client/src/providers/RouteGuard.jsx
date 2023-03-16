import { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { parseToken } from '../utils';
import { ACCESS_SCOPE } from '../constants';

const RouteGuard = ({ children, scope = ACCESS_SCOPE.AnyAuth }) => {
  const location = useLocation();
  const { accessToken, setAccessToken } = useAuth();
  const [user, setUser] = useState(parseToken(accessToken));
  useEffect(() => {
    const obj = parseToken(accessToken);
    if (obj === null && accessToken !== null) setAccessToken(null);
    setUser(obj);
  }, [location, accessToken, setAccessToken]);

  if (user === null && location.pathname !== '/login') {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (!scope.includes(user.role)) return <Navigate to="/" />;

  return children;
};

export default RouteGuard;

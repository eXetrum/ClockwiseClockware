import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { ACCESS_SCOPE } from '../constants';

const RouteGuard = ({ children, scope = ACCESS_SCOPE.AnyAuth }) => {
  const location = useLocation();

  const { authUser: auth } = useSelector(state => state.authReducer);

  if (auth.user === null && location.pathname !== '/login') return <Navigate to="/login" state={{ from: location }} />;

  if (!scope.includes(auth.user.role)) return <Navigate to="/" />;

  return children;
};

export default RouteGuard;

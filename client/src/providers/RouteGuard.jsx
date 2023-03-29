import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { ACCESS_SCOPE, USER_ROLES } from '../constants';

const RouteGuard = ({ children, scope = ACCESS_SCOPE.AnyAuth, redirectTo = '/login' }) => {
  const location = useLocation();

  const { authUser: auth } = useSelector(state => state.authReducer);

  if (auth.user.role === USER_ROLES.GUEST && !scope.includes(auth.user.role) && location.pathname !== redirectTo)
    return <Navigate to={redirectTo} state={{ from: location }} />;

  if (!scope.includes(auth.user.role)) return <Navigate to="/" />;

  return children;
};

export default RouteGuard;

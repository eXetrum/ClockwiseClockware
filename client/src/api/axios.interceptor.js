import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
//import { getCurrentUser, logout } from './auth';
import jwt from 'jwt-decode';
import { ACCESS_TOKEN_KEY_NAME } from '../constants';

import { useAuth } from '../hooks';

const getCurrentUser2 = () => {
  console.log('getCurrentUser OLD');
  const jwtToken = localStorage.getItem(ACCESS_TOKEN_KEY_NAME);
  try {
    const user = jwt(jwtToken);
    user.token = jwtToken;

    const date = new Date();
    const elapsed = date.getTime() / 1000;
    if (user.exp < elapsed) {
      localStorage.removeItem(ACCESS_TOKEN_KEY_NAME);
      return null;
    }
    return user;
  } catch (e) {
    if (jwtToken != null) localStorage.removeItem(ACCESS_TOKEN_KEY_NAME);
  }

  return null;
};

const AxiosInterceptor = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSet, setIsSet] = useState(false);

  const { user, getCurrentUser, getAccessToken } = useAuth();

  const reqInterceptor = useCallback(
    (request) => {
      const user2 = getCurrentUser();
      console.log('user1: ', user);
      console.log('user2: ', user2);
      if (user2 != null) {
        request.headers['Authorization'] = `Bearer ${user2.token}`;
      }
      return request;
    },
    [user],
  );

  //console.log('custom func: ', reqInterceptor({}));

  const reqErrInterceptor = useCallback((error) => Promise.reject(error), []);
  const resInterceptor = useCallback((response) => response, []);

  const resErrInterceptor = useCallback(
    (error) => {
      if (error?.response?.status === 401 && location.pathname !== '/login' && !error?.request?.responseURL?.endsWith('api/login')) {
        localStorage.removeItem(ACCESS_TOKEN_KEY_NAME);
        return navigate('/login', { state: { from: location } });
      }
      return Promise.reject(error);
    },
    [location, navigate],
  );

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(reqInterceptor, reqErrInterceptor);
    const responseInterceptor = axios.interceptors.response.use(resInterceptor, resErrInterceptor);
    setIsSet(true);
    return () => {
      axios.interceptors.response.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [reqInterceptor, reqErrInterceptor, resInterceptor, resErrInterceptor]);

  return isSet && children;
};

export { AxiosInterceptor };

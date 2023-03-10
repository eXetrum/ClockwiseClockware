import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ACCESS_TOKEN_KEY_NAME } from '../constants';

import jwt from 'jwt-decode';

import { login, register } from './auth';

const getCurrentUser = (accessToken) => {
  let user = null;
  try {
    user = jwt(accessToken);
    user.token = accessToken;

    const date = new Date();
    const elapsed = date.getTime() / 1000;
    if (user.exp < elapsed) {
      user = null;
      localStorage.removeItem(ACCESS_TOKEN_KEY_NAME);
    }
    return user;
  } catch (e) {
    user = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY_NAME);
  }

  return user;
};

const AxiosInterceptor = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSet, setIsSet] = useState(false);

  const reqInterceptor = useCallback((request) => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY_NAME);
    const user = getCurrentUser(accessToken);
    console.log('request accessToken=', accessToken);
    if (user !== null) request.headers['Authorization'] = `Bearer ${accessToken}`;
    return request;
  }, []);

  const reqErrInterceptor = useCallback((error) => {
    console.log('request error');
    return Promise.reject(error);
  }, []);
  const resInterceptor = useCallback((response) => {
    console.log('response: ');
    return response;
  }, []);

  const resErrInterceptor = useCallback(
    (error) => {
      console.log('[Intercepter] error: ', error);
      if (error?.response?.status === 401 && location.pathname !== '/login' && !error?.request?.responseURL?.endsWith('api/login')) {
        localStorage.removeItem(ACCESS_TOKEN_KEY_NAME);
        console.log('redirect: ');
        return navigate('/login', { state: { from: location } });
      }
      return Promise.reject(error);
    },
    [location, navigate],
  );

  useEffect(() => {
    console.log('[AxiosInterceptor], useEffect');

    const requestInterceptor = axios.interceptors.request.use(reqInterceptor, reqErrInterceptor);
    const responseInterceptor = axios.interceptors.response.use(resInterceptor, resErrInterceptor);
    setIsSet(true);

    //[requestInterceptor, responseInterceptor] = setup();
    return () => {
      console.log('[AxiosInterceptor], eject');
      //axios.interceptors.response.eject(requestInterceptor);
      //axios.interceptors.response.eject(responseInterceptor);
    };
  }, [reqInterceptor, reqErrInterceptor, resInterceptor, resErrInterceptor]);

  return isSet && children;
};

export { AxiosInterceptor };

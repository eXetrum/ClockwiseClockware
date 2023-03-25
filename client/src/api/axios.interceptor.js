import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import { parseToken } from '../utils';
import { ACCESS_TOKEN_KEY_NAME } from '../constants';

const AxiosInterceptor = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSet, setIsSet] = useState(false);

  const { setAccessToken } = useAuth();

  const reqInterceptor = useCallback(
    (request) => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY_NAME);
      const user = parseToken(accessToken);
      if (user === null && accessToken !== null) setAccessToken(null);
      if (accessToken !== null) request.headers['Authorization'] = `Bearer ${accessToken}`;
      return request;
    },
    [setAccessToken],
  );

  const reqErrInterceptor = useCallback((error) => Promise.reject(error), []);
  const resInterceptor = useCallback((response) => response, []);

  const resErrInterceptor = useCallback(
    (error) => {
      if (error?.response?.status === 401 && location.pathname !== '/login' && !error?.request?.responseURL?.endsWith('api/login')) {
        localStorage.removeItem(ACCESS_TOKEN_KEY_NAME);
        setAccessToken(null);
        return navigate('/login', { state: { from: location } });
      }
      return Promise.reject(error);
    },
    [location, navigate, setAccessToken],
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

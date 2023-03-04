import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logout } from './auth';

const AxiosInterceptor = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSet, setIsSet] = useState(false);

  const reqInterceptor = useCallback((request) => {
    const user = getCurrentUser();
    if (user != null) {
      request.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return request;
  }, []);

  const reqErrInterceptor = useCallback((error) => Promise.reject(error), []);
  const resInterceptor = useCallback((response) => response, []);

  const resErrInterceptor = useCallback(
    (error) => {
      if (error?.response?.status === 401 && location.pathname !== '/login' && !error?.request?.responseURL?.endsWith('api/login')) {
        logout();
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

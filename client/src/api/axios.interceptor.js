import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from './auth';

const AxiosInterceptor = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSet, setIsSet] = useState(false);

    const reqInterceptor = request => {
        console.log('[Front=>Back] AXIOS REQUEST INTERCEPTOR: ', request);
        const user = getCurrentUser();
        if(user != null) {            
            request.headers['Authorization'] = `Bearer ${user.token}`
        }
        return request;
    };

    const reqErrInterceptor = error => {
        console.log('[Front=>Back] AXIOS REQUEST [ERROR] INTERCEPTOR: ', error);
        return Promise.reject(error);
    };

    const resInterceptor = response => {
        console.log('[Front<=Back] AXIOS RESPONSE INTERCEPTOR: ', response?.status, response);
        return response;
    };

    const resErrInterceptor = error => {
        console.log('[Front<=Back] AXIOS RESPONSE [ERROR] INTERCEPTOR: ', error);
        if(error?.response?.status === 401 && location.pathname !== '/login') {
            console.log('Axios do redirect to login');
            return navigate('/login', {state: {from: location}} );
        }
        return Promise.reject(error);
    };

    useEffect(() => {
        console.log('[AxiosInterceptor] useEffect');
        const requestInterceptor = axios.interceptors.request.use(reqInterceptor, reqErrInterceptor);
        const responseInterceptor = axios.interceptors.response.use(resInterceptor, resErrInterceptor);
        console.log('[AxiosInterceptor] useEffect interceptors setup done');
        setIsSet(true);
  
        return () => {
            console.log('[AxiosInterceptor] eject');
            axios.interceptors.response.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        }
    }, []);

    return isSet && children;
};

export { AxiosInterceptor }
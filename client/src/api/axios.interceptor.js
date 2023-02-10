import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from './auth';

//throw new axios.Cancel('Operation canceled by the user.');

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Set default headers to common_axios ( as Instance )
axiosInstance.defaults.headers.common['Authorization'] = null;
axiosInstance.defaults.headers.post['Content-Type'] = 'application/json';

const AxiosInterceptor = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

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
            return navigate('/login', {state: {from: location}} );
        }
        return Promise.reject(error);
    };

    useEffect(() => {
        const requestInterceptor = axiosInstance.interceptors.request.use(reqInterceptor, reqErrInterceptor);
        const responseInterceptor = axiosInstance.interceptors.response.use(resInterceptor, resErrInterceptor);
        
        return () => {
            axiosInstance.interceptors.response.eject(requestInterceptor);
            axiosInstance.interceptors.response.eject(responseInterceptor);
        }
    }, [navigate]);

    return children;
};

export default axiosInstance;
export { AxiosInterceptor }
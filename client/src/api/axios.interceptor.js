import axios from 'axios';
import { getCurrentUser, isLoggedIn } from './auth';

const SetupInterceptor = () => {
    axios.interceptors.request.use(request => {
        let user = getCurrentUser();
        if (isLoggedIn()){
            request.headers['Authorization'] = `Bearer ${user.token}`
        }
        //console.log(request);
        return request;
    }, error => {
        console.log(error);
        return Promise.reject(error);
    });
};

export default SetupInterceptor;
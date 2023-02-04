import axios from 'axios';
import SetupInterceptor from './axios.interceptor';

SetupInterceptor();

// Watch types
const getWatchTypes = () => { return axios.get(`/watch_types`); };

const getAvailableMasters = (city, watchType) => { return axios.get(`/available_masters`, { city, watchType }); };


export {
    getWatchTypes,
    getAvailableMasters
};
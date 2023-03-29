import { api } from './axios.interceptor';

export const getWatches = () => api.get('/watches');

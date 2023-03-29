import { api, apiSecure } from './axios.interceptor';

export const getCities = () => api.get('/cities');

export const createCity = ({ ...params }) => apiSecure.post('/cities', { ...params });

export const deleteCityById = ({ id }) => apiSecure.delete(`/cities/${id}`);

export const getCityById = ({ id }) => apiSecure.get(`/cities/${id}`);

export const updateCityById = ({ id, ...params }) => apiSecure.put(`/cities/${id}`, { ...params });

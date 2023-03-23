import axios from 'axios';

export const getCities = () => axios.get('/cities');

export const createCity = ({ ...params }) => axios.post('/cities', { ...params });

export const deleteCityById = ({ id }) => axios.delete(`/cities/${id}`);

export const getCityById = ({ id }) => axios.get(`/cities/${id}`);

export const updateCityById = ({ id, ...params }) => axios.put(`/cities/${id}`, { ...params });

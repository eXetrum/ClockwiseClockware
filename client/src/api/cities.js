import axios from 'axios';
import SetupInterceptor from './axios.interceptor';

SetupInterceptor();

// Get All
const getCities = () => { return axios.get(`/cities`); };

// Create new city
const createCity = (cityName) => { return axios.post('/cities', { cityName }); };

// Delete city by id
const deleteCityById = (id) => { return axios.delete(`/cities/${id}`); };

// Get city by id
const getCityById = (id) => { return axios.get(`/cities/${id}`); };

// Update by id
const updateCityById = (id, cityName) => { return axios.put(`/cities/${id}`, { cityName }); };

export {
    getCities,
    createCity,
    deleteCityById,
    getCityById,
    updateCityById
};
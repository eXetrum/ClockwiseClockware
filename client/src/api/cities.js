//import axiosInstance from "./axios.interceptor";
import axios from "axios";

// Get All
const getCities = (abortController=null) => { 
    return axios.get(`/cities`, { signal: abortController?.signal}); 
};

// Create new city
const createCity = (cityName, abortController=null) => { 
    return axios.post('/cities', { cityName }, { signal: abortController?.signal}); 
};

// Delete city by id
const deleteCityById = (id, abortController=null) => { 
    return axios.delete(`/cities/${id}`, { signal: abortController?.signal}); 
};

// Get city by id
const getCityById = (id, abortController=null) => { 
    return axios.get(`/cities/${id}`, { signal: abortController?.signal}); 
};

// Update by id
const updateCityById = (id, cityName, abortController=null) => { 
    return axios.put(`/cities/${id}`, { cityName }, { signal: abortController?.signal}); 
};

export {
    getCities,
    createCity,
    deleteCityById,
    getCityById,
    updateCityById
};
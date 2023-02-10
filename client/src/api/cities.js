import axiosInstance from "./axios.interceptor";

// Get All
const getCities = (abortController=null) => { 
    return axiosInstance.get(`/cities`, { signal: abortController?.signal}); 
};

// Create new city
const createCity = (cityName, abortController=null) => { 
    return axiosInstance.post('/cities', { cityName }, { signal: abortController?.signal}); 
};

// Delete city by id
const deleteCityById = (id, abortController=null) => { 
    return axiosInstance.delete(`/cities/${id}`, { signal: abortController?.signal}); 
};

// Get city by id
const getCityById = (id, abortController=null) => { 
    return axiosInstance.get(`/cities/${id}`, { signal: abortController?.signal}); 
};

// Update by id
const updateCityById = (id, cityName, abortController=null) => { 
    return axiosInstance.put(`/cities/${id}`, { cityName }, { signal: abortController?.signal}); 
};

export {
    getCities,
    createCity,
    deleteCityById,
    getCityById,
    updateCityById
};
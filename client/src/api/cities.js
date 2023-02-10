import axiosInstance from "./axios.interceptor";

// Get All
const getCities = () => { return axiosInstance.get(`/cities`); };

// Create new city
const createCity = (cityName) => { return axiosInstance.post('/cities', { cityName }); };

// Delete city by id
const deleteCityById = (id) => { return axiosInstance.delete(`/cities/${id}`); };

// Get city by id
const getCityById = (id) => { return axiosInstance.get(`/cities/${id}`); };

// Update by id
const updateCityById = (id, cityName) => { return axiosInstance.put(`/cities/${id}`, { cityName }); };

export {
    getCities,
    createCity,
    deleteCityById,
    getCityById,
    updateCityById
};
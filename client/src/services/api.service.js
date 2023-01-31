import axios from "axios";

const API_URL = "http://localhost:4200/api";

class ApiService {
    constructor() {
        this.token = localStorage.getItem('user');
    }
    // Items
    getItems() {
        return axios.get(
            `${API_URL}/items`, 
            { headers: {"Authorization" : `Bearer ${this.token}`} }
        );
    }

    // Cities

    // Get All
    getCities() {
        return axios.get(
            `${API_URL}/cities`, 
            { headers: {"Authorization" : `Bearer ${this.token}`} }
        );
    }
    
    // Create new city
    createCity(cityName) {
        return axios.post(
            `${API_URL}/cities`, { cityName },
            { headers: {"Authorization" : `Bearer ${this.token}`} }
        );
    }

    deleteCity(id) {
        return axios.delete(
            `${API_URL}/cities/${id}`,
            { headers: {"Authorization" : `Bearer ${this.token}`} }
        );
    }
    
    // Get city by id
    getCityById(id) {
        return axios.get(
            `${API_URL}/cities/${id}`,
            { headers: {"Authorization" : `Bearer ${this.token}`} }
        );
    }
    
    // Update by id
    updateCityById(id, cityName) {
        return axios.put(
            `${API_URL}/cities/${id}`, { cityName },
            { headers: {"Authorization" : `Bearer ${this.token}`} }
        );
    }

    
    ///////////////////////////////////////////////////////
    // Clients
    // Masters
    // Booking
    getMasters() {
        return axios.get(`${API_URL}/masters`);
    }

    getMasterById(id) {
        return axios.get(`${API_URL}/masters/${id}`);
    }

    updateMaster(id, master) {
        return axios.put(`${API_URL}/masters/${id}`, { master });
    }

    deleteMaster(id) {
        return axios.delete(`${API_URL}/masters/${id}`);
    }  
}

export default new ApiService();
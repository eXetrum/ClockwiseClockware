import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

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

    ///////////////////////////////////////////////////////
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
            `${API_URL}/cities`, 
            { cityName },
            { headers: {"Authorization" : `Bearer ${this.token}`} }
        );
    }

    deleteCityById(id) {
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
    ///////////////////////////////////////////////////////
    // Masters
    getMasters() {
        return axios.get(
            `${API_URL}/masters`,
            { headers: {"Authorization" : `Bearer ${this.token}`} }
        );
    }

    createMaster(master) {
        return axios.post(
            `${API_URL}/masters`, 
            { master },
            { headers: {"Authorization" : `Bearer ${this.token}`} }
        );
    }

    deleteMasterById(id) {
        return axios.delete(
            `${API_URL}/masters/${id}`,
            { headers: {"Authorization" : `Bearer ${this.token}`} }
        );
    } 

    getMasterById(id) {
        return axios.get(
            `${API_URL}/masters/${id}`,
            { headers: {"Authorization" : `Bearer ${this.token}`} }
        );
    }

    updateMaster(id, master) {
        return axios.put(
            `${API_URL}/masters/${id}`, { master },
            { headers: {"Authorization" : `Bearer ${this.token}`} }
        );
    }

     
    // Booking
}

export default new ApiService();
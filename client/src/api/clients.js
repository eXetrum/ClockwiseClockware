//import axiosInstance from "./axios.interceptor";
import axios from "axios";

// Get All
const getClients = () => { 
    console.log('api getClients');
    return axios.get(`/clients`); 
};

// Delete client by id
const deleteClientById = (id) => { return axios.delete(`/clients/${id}`); };

// Get client by id
const getClientById = (id) => { return axios.get(`/clients/${id}`); };

// Update by id
const updateClientById = (id, client) => { return axios.put(`/clients/${id}`, { client }); };

export {
    getClients,
    deleteClientById,
    getClientById,
    updateClientById,
};
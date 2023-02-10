import axiosInstance from "./axios.interceptor";

// Get All
const getClients = () => { return axiosInstance.get(`/clients`); };

// Delete client by id
const deleteClientById = (id) => { return axiosInstance.delete(`/clients/${id}`); };

// Get client by id
const getClientById = (id) => { return axiosInstance.get(`/clients/${id}`); };

// Update by id
const updateClientById = (id, client) => { return axiosInstance.put(`/clients/${id}`, { client }); };

export {
    getClients,
    deleteClientById,
    getClientById,
    updateClientById,
};
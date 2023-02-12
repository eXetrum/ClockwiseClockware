import axios from "axios";

// Get All
const getClients = (abortController=null) => { 
    return axios.get(`/clients`, { signal: abortController?.signal}); 
};

// Delete client by id
const deleteClientById = (id, abortController=null) => { 
    return axios.delete(`/clients/${id}`, { signal: abortController?.signal}); 
};

// Get client by id
const getClientById = (id, abortController=null) => { 
    return axios.get(`/clients/${id}`, { signal: abortController?.signal}); 
};

// Update by id
const updateClientById = (id, client, abortController=null) => { 
    return axios.put(`/clients/${id}`, { client }, { signal: abortController?.signal}); 
};

export {
    getClients,
    deleteClientById,
    getClientById,
    updateClientById,
};
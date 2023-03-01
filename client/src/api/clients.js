import axios from "axios";

const getClients = ({ abortController=null }) => axios.get(`/clients`, { signal: abortController?.signal });

const deleteClientById = ({ id, abortController=null }) => axios.delete(`/clients/${id}`, { signal: abortController?.signal });

const getClientById = ({ id, abortController=null }) => axios.get(`/clients/${id}`, { signal: abortController?.signal });

const updateClientById = ({ id, abortController=null, ...params }) => axios.put(`/clients/${id}`, { ...params }, { signal: abortController?.signal });

export {
    getClients,
    deleteClientById,
    getClientById,
    updateClientById,
};
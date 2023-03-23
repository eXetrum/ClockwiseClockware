import axios from 'axios';

export const getClients = () => axios.get('/clients');

export const createClient = ({ ...params }) => axios.post('/clients', { ...params });

export const deleteClientById = ({ id }) => axios.delete(`/clients/${id}`);

export const getClientById = ({ id }) => axios.get(`/clients/${id}`);

export const updateClientById = ({ id, ...params }) => axios.put(`/clients/${id}`, { ...params });

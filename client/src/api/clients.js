import { apiSecure } from './axios.interceptor';

export const getClients = () => apiSecure.get('/clients');

export const createClient = ({ ...params }) => apiSecure.post('/clients', { ...params });

export const deleteClientById = ({ id }) => apiSecure.delete(`/clients/${id}`);

export const getClientById = ({ id }) => apiSecure.get(`/clients/${id}`);

export const updateClientById = ({ id, ...params }) => apiSecure.put(`/clients/${id}`, { ...params });

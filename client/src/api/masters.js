import { api, apiSecure } from './axios.interceptor';

export const getAvailableMasters = ({ ...params }) => api.get('/masters/available', { params: { ...params } });

export const getMasters = () => apiSecure.get('/masters');

export const createMaster = ({ ...params }) => apiSecure.post('/masters', { ...params });

export const deleteMasterById = ({ id }) => apiSecure.delete(`/masters/${id}`);

export const getMasterById = ({ id }) => apiSecure.get(`/masters/${id}`);

export const updateMasterById = ({ id, ...params }) => apiSecure.put(`/masters/${id}`, { ...params });

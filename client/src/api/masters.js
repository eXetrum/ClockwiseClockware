import axios from 'axios';

export const getMasters = () => axios.get('/masters');

export const createMaster = ({ ...params }) => axios.post('/masters', { ...params });

export const deleteMasterById = ({ id }) => axios.delete(`/masters/${id}`);

export const getMasterById = ({ id }) => axios.get(`/masters/${id}`);

export const updateMasterById = ({ id, ...params }) => axios.put(`/masters/${id}`, { ...params });

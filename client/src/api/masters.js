import axios from 'axios';
import SetupInterceptor from './axios.interceptor';

SetupInterceptor();

// Masters
const getMasters = () => { return axios.get(`/masters`); };

const createMaster = (master) => { return axios.post(`/masters`, { master }); };

const deleteMasterById = (id) => { return axios.delete(`/masters/${id}`); };

const getMasterById = (id) => { return axios.get(`/masters/${id}`); };

const updateMasterById = (id, master) => { return axios.put(`/masters/${id}`, { master }); };


export {
    getMasters,
    createMaster,
    deleteMasterById,
    getMasterById,
    updateMasterById
};
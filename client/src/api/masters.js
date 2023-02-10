import axiosInstance from "./axios.interceptor";

// Masters
const getMasters = () => { return axiosInstance.get(`/masters`); };

const createMaster = (master) => { return axiosInstance.post(`/masters`, { master }); };

const deleteMasterById = (id) => { return axiosInstance.delete(`/masters/${id}`); };

const getMasterById = (id) => { return axiosInstance.get(`/masters/${id}`); };

const updateMasterById = (id, master) => { return axiosInstance.put(`/masters/${id}`, { master }); };


export {
    getMasters,
    createMaster,
    deleteMasterById,
    getMasterById,
    updateMasterById
};
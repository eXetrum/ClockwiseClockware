import axios from "axios";

// Masters
const getMasters = (abortController=null) => { 
    console.log('api getMasters');
    return axios.get(`/masters`, { signal: abortController?.signal}); 
};

const createMaster = (master, abortController=null) => { 
    return axios.post(`/masters`, { master }, { signal: abortController?.signal}); 
};

const deleteMasterById = (id, abortController=null) => { 
    return axios.delete(`/masters/${id}`, { signal: abortController?.signal}); 
};

const getMasterById = (id, abortController=null) => { 
    return axios.get(`/masters/${id}`, { signal: abortController?.signal}); 
};

const updateMasterById = (id, master, abortController=null) => { 
    return axios.put(`/masters/${id}`, { master }, { signal: abortController?.signal}); 
};


export {
    getMasters,
    createMaster,
    deleteMasterById,
    getMasterById,
    updateMasterById
};
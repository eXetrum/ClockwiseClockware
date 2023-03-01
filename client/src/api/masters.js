import axios from "axios";

const getMasters = ({ abortController=null }) => axios.get(`/masters`, { signal: abortController?.signal }); 

const createMaster = ({ abortController=null, ...params }) => axios.post(`/masters`, { ...params }, { signal: abortController?.signal }); 

const deleteMasterById = ({ id, abortController=null }) => axios.delete(`/masters/${id}`, { signal: abortController?.signal });

const getMasterById = ({ id, abortController=null }) => axios.get(`/masters/${id}`, { signal: abortController?.signal });

const updateMasterById = ({ id, abortController=null, ...params }) => axios.put(`/masters/${id}`, { ...params }, { signal: abortController?.signal });

export {
    getMasters,
    createMaster,
    deleteMasterById,
    getMasterById,
    updateMasterById
};
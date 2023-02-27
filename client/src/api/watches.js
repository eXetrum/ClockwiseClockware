import axios from "axios";

// Watch types
const getWatches = (abortController=null) => { 
    return axios.get(`/watches`, { signal: abortController?.signal}); 
};

export {
    getWatches,
};
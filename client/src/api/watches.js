import axios from "axios";

const getWatches = ({ abortController=null }) => axios.get(`/watches`, { signal: abortController?.signal }); 

export { getWatches };
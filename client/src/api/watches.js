import axios from 'axios';

export const getWatches = () => axios.get('/watches');

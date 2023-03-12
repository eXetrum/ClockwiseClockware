import axios from 'axios';

const getCities = ({ abortController = null }) => axios.get('/cities', { signal: abortController?.signal });

const createCity = ({ abortController = null, ...params }) => axios.post('/cities', { ...params }, { signal: abortController?.signal });

const deleteCityById = ({ id, abortController = null }) => axios.delete(`/cities/${id}`, { signal: abortController?.signal });

const getCityById = ({ id, abortController = null }) => axios.get(`/cities/${id}`, { signal: abortController?.signal });

const updateCityById = ({ id, abortController = null, ...params }) =>
  axios.put(`/cities/${id}`, { ...params }, { signal: abortController?.signal });

export { getCities, createCity, deleteCityById, getCityById, updateCityById };

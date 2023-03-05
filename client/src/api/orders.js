import axios from 'axios';

const getAvailableMasters = ({ abortController = null, ...params }) =>
  axios.get('/available_masters', { params: { ...params } }, { signal: abortController?.signal });

const createOrder = ({ abortController = null, ...params }) => axios.post('/orders', { ...params }, { signal: abortController?.signal });

const getOrders = ({ abortController = null }) => axios.get('/orders', { signal: abortController?.signal });

const deleteOrderById = ({ id, abortController = null }) => axios.delete(`/orders/${id}`, { signal: abortController?.signal });

const getOrderById = ({ id, abortController = null }) => axios.get(`/orders/${id}`, { signal: abortController?.signal });

const updateOrderById = ({ id, abortController = null, ...params }) =>
  axios.put(`/orders/${id}`, { ...params }, { signal: abortController?.signal });

export { getAvailableMasters, createOrder, getOrders, deleteOrderById, getOrderById, updateOrderById };

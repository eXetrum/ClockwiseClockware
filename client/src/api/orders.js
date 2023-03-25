import axios from 'axios';

export const getAvailableMasters = ({ ...params }) => axios.get('/available_masters', { params: { ...params } });

export const createOrder = ({ ...params }) => axios.post('/orders', { ...params });

export const getOrders = () => axios.get('/orders');

export const deleteOrderById = ({ id }) => axios.delete(`/orders/${id}`);

export const getOrderById = ({ id }) => axios.get(`/orders/${id}`);

export const updateOrderById = ({ id, ...params }) => axios.put(`/orders/${id}`, { ...params });

export const patchOrderById = ({ id, ...params }) => axios.patch(`/orders/${id}`, { ...params });

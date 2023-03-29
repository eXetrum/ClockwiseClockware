import { apiSecure } from './axios.interceptor';

export const createOrder = ({ ...params }) => apiSecure.post('/orders', { ...params });

export const getOrders = () => apiSecure.get('/orders');

export const deleteOrderById = ({ id }) => apiSecure.delete(`/orders/${id}`);

export const getOrderById = ({ id }) => apiSecure.get(`/orders/${id}`);

export const updateOrderById = ({ id, ...params }) => apiSecure.put(`/orders/${id}`, { ...params });

export const patchOrderById = ({ id, ...params }) => apiSecure.patch(`/orders/${id}`, { ...params });

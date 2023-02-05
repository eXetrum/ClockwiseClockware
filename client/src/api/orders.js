import axios from 'axios';
import SetupInterceptor from './axios.interceptor';

SetupInterceptor();

// Watch types
const getWatchTypes = () => { return axios.get(`/watch_types`); };

const getAvailableMasters = (cityId, watchTypeId, dateTime) => { 
    return axios.get(`/available_masters`, { 
        params: { 
            cityId: cityId, 
            watchTypeId: watchTypeId, 
            dateTime: dateTime,
        } 
    }); 
};

const createOrder = (order) => {
    return axios.post(`/orders`, { order });
};

const getOrders = () => {
    return axios.get(`/orders`);
};

const deleteOrderById = (id) => {
    return axios.delete(`/orders/${id}`);
};

export {
    getWatchTypes,
    getAvailableMasters,
    createOrder,
    getOrders,
    deleteOrderById
};
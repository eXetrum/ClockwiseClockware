//import axiosInstance from "./axios.interceptor";
import axios from "axios";

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

const getOrderById = (id) => {
    return axios.get(`/orders/${id}`);
};

const updateOrderById = (id, order) => {
    return axios.put(`/orders/${id}`, { order })
};

export {
    getWatchTypes,
    getAvailableMasters,
    createOrder,
    getOrders,
    deleteOrderById,
    getOrderById,
    updateOrderById
};
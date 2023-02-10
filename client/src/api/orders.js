import axiosInstance from "./axios.interceptor";

// Watch types
const getWatchTypes = () => { return axiosInstance.get(`/watch_types`); };

const getAvailableMasters = (cityId, watchTypeId, dateTime) => { 
    return axiosInstance.get(`/available_masters`, { 
        params: { 
            cityId: cityId, 
            watchTypeId: watchTypeId, 
            dateTime: dateTime,
        } 
    }); 
};

const createOrder = (order) => {
    return axiosInstance.post(`/orders`, { order });
};

const getOrders = () => {
    return axiosInstance.get(`/orders`);
};

const deleteOrderById = (id) => {
    return axiosInstance.delete(`/orders/${id}`);
};

const getOrderById = (id) => {
    return axiosInstance.get(`/orders/${id}`);
};

const updateOrderById = (id, order) => {
    return axiosInstance.put(`/orders/${id}`, { order })
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
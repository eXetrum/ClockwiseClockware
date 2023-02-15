import axios from "axios";

// Watch types
const getWatchTypes = (abortController=null) => { 
    return axios.get(`/watch_types`, { signal: abortController?.signal}); 
};

const getAvailableMasters = (cityId, watchTypeId, timestamp, clientTimezone, abortController=null) => { 
    return axios.get(`/available_masters`, { 
        params: { 
            cityId: cityId, 
            watchTypeId: watchTypeId, 
            timestamp: startDateTimestamp,
            clientTimezone: clientTimezone
        }
    }, { signal: abortController?.signal}); 
};

const createOrder = (order, abortController=null) => {
    return axios.post(`/orders`, { order }, { signal: abortController?.signal});
};

const getOrders = (abortController=null) => {
    return axios.get(`/orders`, { signal: abortController?.signal});
};

const deleteOrderById = (id, abortController=null) => {
    return axios.delete(`/orders/${id}`, { signal: abortController?.signal});
};

const getOrderById = (id, abortController=null) => {
    return axios.get(`/orders/${id}`, { signal: abortController?.signal});
};

const updateOrderById = (id, order, abortController=null) => {
    return axios.put(`/orders/${id}`, { order }, { signal: abortController?.signal})
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
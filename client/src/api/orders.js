import axios from "axios";

const getAvailableMasters = (cityId, watchId, startDate, abortController=null) => { 
    return axios.get(`/available_masters`, { 
        params: { 
            cityId: cityId, 
            watchId: watchId, 
            startDate: startDate,
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
    getAvailableMasters,
    createOrder,
    getOrders,
    deleteOrderById,
    getOrderById,
    updateOrderById
};
export { login, register, resetPassword, resendEmailConfirmation, verifyEmail } from './auth';
export { getWatches } from './watches';
export { getCities, createCity, deleteCityById, getCityById, updateCityById } from './cities';
export { getMasters, createMaster, deleteMasterById, getMasterById, updateMasterById, getAvailableMasters } from './masters';
export { getClients, createClient, deleteClientById, getClientById, updateClientById } from './clients';
export { createOrder, getOrders, deleteOrderById, getOrderById, updateOrderById, patchOrderById } from './orders';

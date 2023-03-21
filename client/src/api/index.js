export { login, register, resetPassword, resendEmailConfirmation, verifyEmail } from './auth';
export { getWatches } from './watches';
export { getCities, createCity, deleteCityById, getCityById, updateCityById } from './cities';
export { getMasters, createMaster, deleteMasterById, getMasterById, updateMasterById } from './masters';
export { getClients, createClient, deleteClientById, getClientById, updateClientById } from './clients';
export { getAvailableMasters, createOrder, getOrders, deleteOrderById, getOrderById, updateOrderById, patchOrderById } from './orders';

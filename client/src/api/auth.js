import { api, apiSecure } from './axios.interceptor';

export const login = ({ ...params }) => api.post('/login', { ...params });

export const register = ({ ...params }) => api.post('/register', { ...params });

export const resetPassword = ({ ...params }) => apiSecure.post('/reset_password', { ...params });

export const resendEmailConfirmation = ({ ...params }) => apiSecure.post('/resend_email_confirmation', { ...params });

export const verifyEmail = ({ token }) => api.get(`/verify/${token}`);

import axios from 'axios';

export const login = ({ ...params }) => axios.post('/login', { ...params });

export const register = ({ ...params }) => axios.post('/register', { ...params });

export const resetPassword = ({ ...params }) => axios.post('/reset_password', { ...params });

export const resendEmailConfirmation = ({ ...params }) => axios.post('/resend_email_confirmation', { ...params });

export const verifyEmail = ({ token }) => axios.get(`/verify/${token}`);

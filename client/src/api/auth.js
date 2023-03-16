import axios from 'axios';

const login = ({ abortController = null, ...params }) => axios.post('/login', { ...params }, { signal: abortController?.signal });

const register = ({ abortController = null, ...params }) => axios.post('/register', { ...params }, { signal: abortController?.signal });

const resetPassword = ({ abortController = null, ...params }) =>
  axios.post('/reset_password', { ...params }, { signal: abortController?.signal });

const resendEmailConfirmation = ({ abortController = null, ...params }) =>
  axios.post('/resend_email_confirmation', { ...params }, { signal: abortController?.signal });

export { login, register, resetPassword, resendEmailConfirmation };

import axios from 'axios';

const login = ({ abortController = null, ...params }) => axios.post('/login', { ...params }, { signal: abortController?.signal });

const register = ({ abortController = null, ...params }) => axios.post('/register', { ...params }, { signal: abortController?.signal });

export { login, register };

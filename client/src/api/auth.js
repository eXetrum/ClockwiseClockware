import jwt from 'jwt-decode';
import axios from 'axios';

const login = ({ abortController = null, ...params }) => axios.post('/login', { ...params }, { signal: abortController?.signal });

const register = ({ abortController = null, ...params }) => axios.post('/register', { ...params }, { signal: abortController?.signal });

const logout = () => localStorage.removeItem('user');

const setToken = (token) => localStorage.setItem('user', token);

const getCurrentUser = () => {
  const jwtToken = localStorage.getItem('user');
  try {
    const user = jwt(jwtToken);
    user.token = jwtToken;

    const date = new Date();
    const elapsed = date.getTime() / 1000;
    if (user.exp < elapsed) {
      logout();
      return null;
    }
    return user;
  } catch (e) {
    if (jwtToken != null) logout();
  }

  return null;
};

const isLoggedIn = () => getCurrentUser() != null;

export { login, logout, register, setToken, getCurrentUser, isLoggedIn };

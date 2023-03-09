import jwt from 'jwt-decode';
import axios from 'axios';

import { ACCESS_TOKEN_KEY_NAME } from '../constants';

const login = ({ abortController = null, ...params }) => axios.post('/login', { ...params }, { signal: abortController?.signal });

const register = ({ abortController = null, ...params }) => axios.post('/register', { ...params }, { signal: abortController?.signal });

const logout = () => localStorage.removeItem(ACCESS_TOKEN_KEY_NAME);

//const setToken = (token) => localStorage.setItem('user', token);

const getCurrentUser = () => {
  console.log('getCurrentUser OLD');
  const jwtToken = localStorage.getItem(ACCESS_TOKEN_KEY_NAME);
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

//export { login, logout, register, setToken, getCurrentUser, isLoggedIn };
export { login, register, getCurrentUser, isLoggedIn };

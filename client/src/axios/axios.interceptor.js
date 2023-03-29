import axios from 'axios';
import { destroyAuth } from '../store/actions/destroyAuthAction';

let store;

export const injectStore = _store => {
  store = _store;
};

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiSecure = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiSecure.interceptors.request.use(config => {
  const { authUser } = store.getState().authReducer;
  config.headers['Authorization'] = `Bearer ${authUser.accessToken}`;
  return config;
});

apiSecure.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const { authUser } = store.getState().authReducer;
    if (error.response.status === 401 && authUser.accessToken) {
      store.dispatch(destroyAuth());
    } else {
      // eslint-disable-next-line
      console.error(error);
    }
    return Promise.reject(error);
  },
);

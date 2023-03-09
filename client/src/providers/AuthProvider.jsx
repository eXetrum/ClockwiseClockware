import React, { createContext, useContext, useEffect, useState } from 'react';
import jwt from 'jwt-decode';
import { ACCESS_TOKEN_KEY_NAME } from '../constants';
//import { useAuth } from '../hooks';

const logout = () => localStorage.removeItem(ACCESS_TOKEN_KEY_NAME);

const isLoggedIn = () => getCurrentUser() != null;

const getCurrentUser = (accessToken) => {
  let user = null;
  try {
    user = jwt(accessToken);
    user.token = accessToken;

    const date = new Date();
    const elapsed = date.getTime() / 1000;
    if (user.exp < elapsed) {
      user = null;
      logout();
    }
  } catch (e) {
    user = null;
    logout();
  }

  return user;
  /*if (accessToken === 'awesomeAccessToken123456789') {
    return {
      name: 'Thomas',
    };
  }*/
};

const initialState = {
  user: null,
  accessToken: null,
};

const AuthContext = createContext(initialState);

export const AuthProvider = ({ children }) => {
  //const { user, accessToken } = useAuth();
  const token = localStorage.getItem(ACCESS_TOKEN_KEY_NAME);
  const [accessToken, setAccessToken] = useState(token);
  const [user, setUser] = useState(null);

  const handleAccessTokenChange = () => {
    if (user === null && accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY_NAME, accessToken);
      const user = getCurrentUser(accessToken);
      setUser(user);
    } else if (!accessToken) {
      // Log Out
      logout();
      setUser(null);
    }
  };

  useEffect(() => {
    console.log('[AuthProvider]: ', accessToken);
    handleAccessTokenChange();
  }, [accessToken]);

  return <AuthContext.Provider value={{ user, accessToken, setAccessToken }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

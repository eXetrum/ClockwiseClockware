import React, { useState, useEffect, useContext, createContext } from 'react';
import { parseToken } from '../utils';
import { ACCESS_TOKEN_KEY_NAME } from '../constants';

const authContext = createContext();

export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => useContext(authContext);

function useProvideAuth(token = localStorage.getItem(ACCESS_TOKEN_KEY_NAME)) {
  const [accessToken, setAccessToken] = useState(token);

  useEffect(() => {
    const user = parseToken(accessToken);
    if (user === null && accessToken !== null) {
      localStorage.removeItem(ACCESS_TOKEN_KEY_NAME);
      setAccessToken(null);
    } else {
      localStorage.setItem(ACCESS_TOKEN_KEY_NAME, accessToken);
    }
  }, [accessToken]);

  return { accessToken, setAccessToken };
}

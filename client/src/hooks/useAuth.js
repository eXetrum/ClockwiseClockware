import { useEffect, useState } from 'react';
import jwt from 'jwt-decode';
import { ACCESS_TOKEN_KEY_NAME } from '../constants';

const logout = () => localStorage.removeItem(ACCESS_TOKEN_KEY_NAME);

const getCurrentUser = (accessToken) => {
  let user = null;
  try {
    user = jwt(accessToken);
    user.token = accessToken;

    const date = new Date();
    const elapsed = date.getTime() / 1000;
    if (user.exp < elapsed) {
      user = null;
      localStorage.removeItem(ACCESS_TOKEN_KEY_NAME);
    }
    return user;
  } catch (e) {
    user = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY_NAME);
  }

  return user;
};

export default function useAuth() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY_NAME);
  const [accessToken, setAccessToken] = useState(token);
  const [user, setUser] = useState(getCurrentUser(token));

  useEffect(() => {
    localStorage.setItem(ACCESS_TOKEN_KEY_NAME, accessToken);
    setUser(getCurrentUser(accessToken));
  }, [accessToken]);

  return { user, accessToken, setAccessToken, logout };
}

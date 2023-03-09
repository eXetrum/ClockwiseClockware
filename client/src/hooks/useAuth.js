import React, { useEffect, useState } from 'react';
import jwt from 'jwt-decode';
import { ACCESS_TOKEN_KEY_NAME } from '../constants';

const logout = () => localStorage.removeItem(ACCESS_TOKEN_KEY_NAME);

const isLoggedIn = () => getCurrentUser() != null;

const getCurrentUser1 = (accessToken) => {
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
    console.log('getCurrentUser error: ', e, accessToken);
    user = null;
    logout();
  }

  return user;
};

const defaultState = {
  user: null,
  accessToken: null,
};

const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY_NAME);
const getCurrentUser = () => getCurrentUser1(getAccessToken());

export default function useAuth(whoCalls = '') {
  //const token = localStorage.getItem(ACCESS_TOKEN_KEY_NAME);
  //const [user, setUser] = useState(getCurrentUser(token));
  //const [accessToken, setAccessToken] = useState(token);
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY_NAME);
  const setAccessToken = (token) => localStorage.setItem(ACCESS_TOKEN_KEY_NAME, token);

  /*console.log('useAuth: ', whoCalls);
  useEffect(() => {
    console.log('useAuth, useEffect: ', accessToken);
    //setUser(getCurrentUser(accessToken));
    localStorage.setItem(ACCESS_TOKEN_KEY_NAME, accessToken);
  }, [accessToken]);*/

  return { user: getCurrentUser(), getCurrentUser, getAccessToken, accessToken, setAccessToken, logout };
}

export default function useAuth() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY_NAME);
  const [accessToken, setAccessToken] = useState(token);
  const [user, setUser] = useState(getCurrentUser(token));

  useEffect(() => {
    console.log('useAuth, useEffect: ', accessToken);
    setUser(getCurrentUser(accessToken));
    localStorage.setItem(ACCESS_TOKEN_KEY_NAME, accessToken);
  }, [accessToken]);

  return { user, accessToken, setAccessToken};
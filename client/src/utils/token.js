import jwt from 'jwt-decode';

export const parseToken = accessToken => {
  try {
    const user = jwt(accessToken);
    const date = new Date();
    const elapsed = date.getTime() / 1000;
    if (user.exp < elapsed) {
      return null;
    }
    return user;
  } catch (e) {}

  return null;
};

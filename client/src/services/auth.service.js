import axios from "axios";
import jwt from 'jwt-decode';

const API_URL = "http://localhost:4200/api";

class AuthService {
  login(email, password) {
    return axios
      .post(`${API_URL}/login`, {
        email,
        password
      });
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(username, email, password) {
    return axios.post(API_URL + "register", {
      username,
      email,
      password
    });
  }

  getCurrentUser() {
    let jwtToken = localStorage.getItem('user');
    try {
      return jwt(jwtToken);
    } catch(e) { }
    return null;
  }
}

export default new AuthService();
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
    return axios.post(`${API_URL}/register`, {
      username,
      email,
      password
    });
  }

  getCurrentUser() {
    let jwtToken = localStorage.getItem('user');
    try {
      /*jwt.verify(token, 'shhhhh', function(err, decoded) {
        if (err) {
          
          //  err = {
          //    name: 'TokenExpiredError',
          //    message: 'jwt expired',
          //    expiredAt: 1408621000
          //  }
          
        }
      });*/
      let user = jwt(jwtToken);
      let date = new Date();
      let elapsed = date.getTime() / 1000;
      if(user.exp < elapsed) {
        this.logout();
        return null;
      }
      return user;
    } catch(e) { this.logout(); console.log('error: ', e);}
    return null;
  }
  
  isLogged() {
    return this.getCurrentUser() != null;
  }
}

export default new AuthService();
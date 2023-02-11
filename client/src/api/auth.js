import jwt from 'jwt-decode';
//import axiosInstance from "./axios.interceptor";
import axios from 'axios';

const login = (email, password) => {
	return axios.post(`/login`, {
		email,
		password
	});
};

const logout = () => { localStorage.removeItem("user"); };

const setToken = (token) => { localStorage.setItem("user", token); }

const register = (username, email, password) => {
	return axios.post(`/register`, {
		username,
		email,
		password
	});
};

const getCurrentUser = () => {
	let jwtToken = localStorage.getItem('user');
	try {
		let user = jwt(jwtToken);
		user.token = jwtToken;

		let date = new Date();
		let elapsed = date.getTime() / 1000;
		if(user.exp < elapsed) {
			logout();
			return null;
		}
		return user;
	} catch(e) { if(jwtToken != null) logout(); }
	
	return null;
};

const isLoggedIn = () => { return getCurrentUser() != null; };

export {
	login,
	logout,
	register,
	setToken,
	getCurrentUser,
	isLoggedIn
};
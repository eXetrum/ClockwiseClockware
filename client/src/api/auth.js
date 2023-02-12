import jwt from 'jwt-decode';
import axios from 'axios';

const login = (email, password, abortController=null) => {
	return axios.post(`/login`, {
		email,
		password,
	}, { signal: abortController?.signal});
};

const register = (username, email, password, abortController=null) => {
	return axios.post(`/register`, {
		username,
		email,
		password
	}, { signal: abortController?.signal});
};

const logout = () => { localStorage.removeItem("user"); };

const setToken = (token) => { localStorage.setItem("user", token); }

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
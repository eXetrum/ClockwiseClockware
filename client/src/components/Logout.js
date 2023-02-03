import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container';
import Header from './Header';
import AuthService from "../services/auth.service";


const LogOut = () => {

	const [redirect, setRedirect] = useState(false);

	useEffect(()=> {
		AuthService.logout();
		setRedirect(true);	
	}, []);


	return (
		<>
    	{redirect &&  <Navigate to="/" />}
		{!redirect &&
		<Container>
			<Header />
			<p>Logout...</p>
		</Container>}
		</>
	);
};

export default LogOut;
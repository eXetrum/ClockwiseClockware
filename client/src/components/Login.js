import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { 
	Container, Row, Col, Form, Button, Alert
} from 'react-bootstrap';
import Header from './Header';
import ErrorServiceOffline from './ErrorServiceOffline';
import ErrorNotFound from './ErrorNotFound';
import { isLoggedIn, login, setToken } from '../api/auth';

import { useSnackbar } from 'notistack';

const Login = () => {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const navigate = useNavigate();
	const location = useLocation();
	const fromPage = location.state?.from?.pathname || '/';

	const [user, setUser] = useState({email: '', password: ''});
	const [pending, setPending] = useState(false);
	const [redirect, setRedirect] = useState(isLoggedIn());
	const [error, setError] = useState(null);

	const doLogin = async (email, password) => {
		try {
			const response = await login(email, password);
			if(response && response.data && response.data.accessToken) {
				setToken(response.data.accessToken);
				setRedirect(true);
			}
		} catch(e) {
			console.log("LOGIN ERROR: ", e);
			setError(e);
			if(e && e.response && e.response.data && e.response.data.detail) {
				enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
			}
		} finally {
			setPending(false);
		}
	};

	const handleChange = (event) => {
		const inputField = event.target.name
		const inputValue = event.target.value
		
		setUser((prev) => ({...prev, [inputField]: inputValue }));

		setError(null);
	};

	if(redirect) {
		return (<Navigate to={fromPage} />);
	}

	return (
		<Container>
			<Header />
			<Container>
				<hr/>
				<Row className="justify-content-md-center">
					<Col xs lg="4" md="auto">
						<h1>Login page</h1>
						<Form onSubmit={(event) => {
							event.preventDefault();
					
							setPending(true);
							setError(null);
							
							doLogin(user.email, user.password);
						}}>
						<Form.Group className="mb-3">
						<Form.Label>Email address</Form.Label>
						<Form.Control type="email" placeholder="Enter email" 
							name="email"
							onChange={handleChange} 
							value={user.email}
							disabled={pending}
						/>
						</Form.Group>
						<Form.Group className="mb-3">
						<Form.Label>Password</Form.Label>
						<Form.Control type="password" placeholder="Password" 
							name="password"
							onChange={handleChange} 
							value={user.password}
							disabled={pending}
						/>
						</Form.Group>
						<Button variant="primary" type="submit" disabled={!user.email || !user.password || pending}>
						Login
						</Button>                
					</Form>
					</Col>
				</Row>
				
				<hr/>
				<ErrorServiceOffline error={error} pending={pending} />
            	<ErrorNotFound error={error} pending={pending} />
			</Container>
      	</Container>
	);
};

export default Login;
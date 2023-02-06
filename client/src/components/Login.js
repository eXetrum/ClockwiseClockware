import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { 
	Container, Row, Col, Form, Button, Alert
} from 'react-bootstrap';
import Header from './Header';
import { isLoggedIn, login, setToken } from '../api/auth';


const LogIn = () => {
	const [user, setUser] = useState({email: '', password: ''});
	const [pending, setPending] = useState(false);
	const [redirect, setRedirect] = useState(false);
	const [info, setInfo] = useState(null);
	const [error, setError] = useState(null);

	useEffect( () => {
		setRedirect(isLoggedIn());
	}, []);
	
	const handleChange = (event) => {
    	const inputField = event.target.name
    	const inputValue = event.target.value
		
		setUser((prev) => ({...prev, [inputField]: inputValue }));
		
		setInfo(null);
		setError(null);
	};

  	const handleSubmit = (event) => {
		event.preventDefault();

		setPending(true);
		setInfo(null);
		setError(null);

		const doLogin = async (email, password) => {
			try {
				const response = await login(email, password);
				if(response && response.data && response.data.accessToken) {
					setToken(response.data.accessToken);
					setRedirect(true);
				}
			} catch(e) {
				if(e && e.response && e.response.status === 401) {
					setError('Incorrect login/password');
				} else {
					setError(e);
				}
			} finally {
				setPending(false);
			}
		};
		
		doLogin(user.email, user.password);
  	};

	return (
		<>
		{redirect && <Navigate to="/"/>}
		{!redirect &&
		<Container>
			<Header />
			<Container>
				<hr/>
				<Row className="justify-content-md-center">
					<Col xs lg="4" md="auto">
					<h1>Login page</h1>
					<Form onSubmit={handleSubmit}>
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
				<Row className="justify-content-md-center">
					<Col md="auto">
						{info && <Alert key='success' variant='success'>{info}</Alert>}
						{error && <Alert key='danger' variant='danger'>{error.toString()}</Alert>}
					</Col>
				</Row>
			</Container>
      	</Container>
		}
		</>
	);
};

export default LogIn;